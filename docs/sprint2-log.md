# Sprint 2 Log

## Overview
Sprint 2 was about making sure the three user types — SUPERADMIN, ADMIN, and USER — can only do what they are supposed to do in the system. We also checked that when an employee is removed, the related job history gets updated too. And we made sure that certain hidden fields in the database do not show up when someone views the data.

## Pull Requests
| PR | Branch | What It Contains |
|----|--------|-----------------|
| PR-01 | test/sprint2-rights-51-cases | 51 tests checking what each user type can and cannot do |
| PR-02 | test/sprint2-cascade-visibility | Tests for removing employees, recovering them, and hidden fields |
| PR-03 | docs/sprint2-log | This file |

## What We Checked
- All 51 tests for user rights pass
- When an employee is removed, their job history is also marked as removed
- When an employee is recovered, their job history is also marked as active again
- The stamp field (which records who did an action and when) is hidden from USER in all 4 tables: employee, jobHistory, job, and department
- SUPERADMIN and ADMIN can see the stamp field directly
- No one can bypass the system to do something they are not allowed to do

## Problems We Found and Fixed

### Problem 1 — The test file was using wrong user type names
The original tests used ADMIN, MANAGER, and EMPLOYEE as user types. But in HopeHRS the actual user types are SUPERADMIN, ADMIN, and USER. MANAGER and EMPLOYEE do not exist in this system.
What we did: Rewrote all tests to use the correct user types — SUPERADMIN, ADMIN, and USER.

### Problem 2 — The tests were checking rights that do not exist
The original tests checked things like "can the user view salary" or "can the user manage budget." These are not real rights in HopeHRS. The actual rights in the system are things like EMP_VIEW, EMP_ADD, EMP_EDIT, JH_VIEW, DEPT_DEL, and so on.
What we did: Replaced all made-up rights with the 17 actual rights from the HopeHRS guide.

### Problem 3 — The test count was grouped the wrong way
The original tests were grouped as 10 + 15 + 15 + 11 = 51. But the correct way is 3 user types times 17 rights which equals 51. The structure was wrong even if the number was right.
What we did: Reorganized all 51 tests into 3 groups — one group per user type — with 17 tests each covering each right.

### Problem 4 — The status field name was wrong
The tests used field names like isDeleted and isActive to track whether an employee or job history record was active or removed. But in HopeHRS the actual field is called record_status and its value is either ACTIVE or INACTIVE.
What we did: Updated every test in sections A and B to use record_status with the correct values.

### Problem 5 — The stamp field was written incorrectly
The tests used two separate fields called createdBy and updatedBy to track who made a change. But in HopeHRS there is only one field called stamp and it stores everything together in one value, for example: DEACTIVATED 00001 2026-05-08T00:00:00Z.
What we did: Replaced all createdBy and updatedBy references with the single stamp field in the correct format.

### Problem 6 — The stamp was only checked in 2 tables
The sprint requirement says the stamp must be confirmed hidden from USER in all 4 tables. The tests only covered the employee table and the jobHistory table. The job table and the department table were missing.
What we did: Added tests for all 4 tables — employee, jobHistory, job, and department.

### Problem 7 — Who can see the stamp was wrong
The tests said that ADMIN can only see the stamp through the audit log and not directly. But the project guide says SUPERADMIN and ADMIN can see the stamp directly in the table view. Only USER cannot see it.
What we did: Fixed the tests so that ADMIN and SUPERADMIN are correctly shown as being able to see the stamp directly, and USER is correctly shown as not being able to see it.

### Problem 8 — Table name was written in plural
The tests used employees with an s at the end. But the actual table in HopeHRS is called employee without an s.
What we did: Changed every reference from employees to employee to match the actual table name.

## Final Result
All issues were found and fixed. All 51 required tests pass. The removal and recovery of employees works correctly with job history. The stamp field is properly hidden from USER in all 4 tables. The tests now match the actual HopeHRS system.