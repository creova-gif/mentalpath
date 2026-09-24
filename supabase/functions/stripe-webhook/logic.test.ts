import { assert, assertEquals, assertRejects } from "jsr:@std/assert@1";
import { isStale, planForPrice, signForTest, subscriptionToUpdate, verifyStripeSignature } from "./logic.ts";

const prices = { solo: "price_solo", group: "price_group" };
const now = 1_790_000_000;

function subscription(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub_123",
    customer: "cus_123",
    status: "active",
    trial_end: null,
    cancel_at: null,
    metadata: { clinician_id: "11111111-1111-1111-1111-111111111111" },
    items: {
      data: [{
        quantity: 1,
        current_period_end: now + 30 * 86400,
        price: { id: "price_solo", unit_amount: 4900, recurring: { interval: "month" } },
      }],
    },
    ...overrides,
  };
}

Deno.test("verifyStripeSignature accepts a valid signature", async () => {
  const payload = JSON.stringify({ id: "evt_1", type: "customer.subscription.updated" });
  const header = await signForTest(payload, "whsec_test", now);
  const event = await verifyStripeSignature(payload, header, "whsec_test", now);
  assertEquals(event.id, "evt_1");
});

Deno.test("verifyStripeSignature accepts any matching v1 during secret rotation", async () => {
  const payload = "{}";
  const good = (await signForTest(payload, "whsec_new", now)).split(",")[1];
  const header = `t=${now},v1=${"0".repeat(64)},${good}`;
  await verifyStripeSignature(payload, header, "whsec_new", now);
});

Deno.test("verifyStripeSignature rejects tampered payloads, wrong secrets and old timestamps", async () => {
  const payload = JSON.stringify({ id: "evt_1" });
  const header = await signForTest(payload, "whsec_test", now);
  await assertRejects(() => verifyStripeSignature(payload + " ", header, "whsec_test", now), Error, "mismatch");
  await assertRejects(() => verifyStripeSignature(payload, header, "whsec_other", now), Error, "mismatch");
  await assertRejects(() => verifyStripeSignature(payload, header, "whsec_test", now + 301), Error, "tolerance");
  await assertRejects(() => verifyStripeSignature(payload, "v1=abc", "whsec_test", now), Error, "header");
});

Deno.test("planForPrice maps only prices we sell", () => {
  assertEquals(planForPrice("price_solo", prices), "solo");
  assertEquals(planForPrice("price_group", prices), "group");
  assertEquals(planForPrice("price_other", prices), null);
  assertEquals(planForPrice(undefined, prices), null);
});

Deno.test("subscriptionToUpdate maps an active Solo subscription", () => {
  const update = subscriptionToUpdate(subscription(), now, prices)!;
  assertEquals(update.plan_type, "solo");
  assertEquals(update.subscription_status, "active");
  assertEquals(update.is_trial, false);
  assertEquals(update.stripe_subscription_id, "sub_123");
  assertEquals(update.price_per_seat, 49);
  assertEquals(update.plan_cycle, "monthly");
  assertEquals(update.current_period_end, new Date((now + 30 * 86400) * 1000).toISOString());
  assertEquals(update.billing_updated_at, new Date(now * 1000).toISOString());
});

Deno.test("subscriptionToUpdate handles trialing, cancellation and unknown prices", () => {
  const trial = subscriptionToUpdate(subscription({ status: "trialing", trial_end: now + 86400 }), now, prices)!;
  assert(trial.is_trial);
  assertEquals(trial.trial_ends_at, new Date((now + 86400) * 1000).toISOString());

  const canceled = subscriptionToUpdate(subscription({ status: "canceled" }), now, prices)!;
  assertEquals(canceled.subscription_status, "canceled");
  assertEquals(canceled.stripe_subscription_id, null);

  const weird = subscriptionToUpdate(subscription({ status: "something_new" }), now, prices)!;
  assertEquals(weird.subscription_status, "incomplete");

  const other = subscription();
  other.items.data[0].price.id = "price_unknown";
  assertEquals(subscriptionToUpdate(other, now, prices), null);
});

Deno.test("isStale ignores out-of-order events", () => {
  const applied = new Date(now * 1000).toISOString();
  assert(isStale(now - 1, applied));
  assert(!isStale(now, applied));
  assert(!isStale(now + 1, applied));
  assert(!isStale(now, null));
});
