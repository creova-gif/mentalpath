-- Invoice numbers are server-assigned per clinician; paid_at tracks status.
BEGIN;
SELECT test_seed_users();
SELECT test_login('11111111-1111-1111-1111-111111111111');
INSERT INTO invoices (clinician_id, client_name, amount) VALUES (auth.uid(), 'A', 140);
INSERT INTO invoices (clinician_id, client_name, amount) VALUES (auth.uid(), 'B', 140);
SELECT expect_count($$SELECT 1 FROM invoices WHERE invoice_number IN ('INV-0001','INV-0002')$$, 2);
UPDATE invoices SET status = 'paid' WHERE invoice_number = 'INV-0001';
SELECT expect_count($$SELECT 1 FROM invoices WHERE invoice_number = 'INV-0001' AND paid_at IS NOT NULL$$, 1);
UPDATE invoices SET status = 'pending' WHERE invoice_number = 'INV-0001';
SELECT expect_count($$SELECT 1 FROM invoices WHERE invoice_number = 'INV-0001' AND paid_at IS NULL$$, 1);
SELECT expect_error($$UPDATE invoices SET status = 'bogus'$$, '%invoices_status_valid%');
SELECT expect_error($$INSERT INTO invoices (clinician_id, client_name, amount) VALUES (auth.uid(), 'C', -5)$$, '%invoices_amount_valid%');
-- Numbering is per clinician
RESET ROLE;
SELECT test_login('22222222-2222-2222-2222-222222222222');
INSERT INTO invoices (clinician_id, client_name, amount) VALUES (auth.uid(), 'Z', 100);
SELECT expect_count($$SELECT 1 FROM invoices WHERE invoice_number = 'INV-0001'$$, 1);
ROLLBACK;
