# Security Specification for CleanCloud Laundry

## 1. Data Invariants
- `receipt_number` must be unique and immutable after creation.
- `status` must follow the sequence: `washing` -> `drying` -> `ironing` -> `completed`.
- Only `admins` can create, update, or delete orders.
- Customers can only read orders if they have the exact `receipt_number`.

## 2. The "Dirty Dozen" Payloads

1. **Identity Spoofing**: Attempt to create an order as an unauthenticated user.
2. **Path Injection**: Attempt to create a document with a malicious ID (e.g., `../../../etc/passwd`).
3. **Admin Escalation**: Attempt to add own UID to the `/admins` collection.
4. **Status Shortcutting**: Attempt to update status from `washing` directly to `completed`.
5. **PII Leak**: Attempt to list all orders (finding all customer names/phones) as a non-admin.
6. **Data Type Mismatch**: Providing a number for `customer_name`.
7. **Resource Exhaustion**: Sending a 1MB string as `customer_name`.
8. **Unauthorized Update**: Attempting to change the `receipt_number` of an existing order.
9. **Timestamp Spoofing**: Sending a future `created_at` timestamp.
10. **Orphaned Writes**: Creating an order without a `date_received`.
11. **Negative Weight**: (App-specific) Providing invalid laundry details.
12. **Status Corruption**: Updating `status` to an invalid enum value like `delivered`.

## 3. Test Cases (Summary)
- `GET /orders` -> DENIED (unless Admin)
- `GET /orders?where=receipt_number == 'X'` -> ALLOWED (Public, but restricted to query-by-receipt)
- `POST /orders` -> DENIED (unless Admin)
- `PATCH /orders/{id}` -> DENIED (unless Admin)
- `DELETE /orders/{id}` -> DENIED (unless Admin)
