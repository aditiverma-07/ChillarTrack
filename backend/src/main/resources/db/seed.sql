-- ChillarTrack Sample Seed Data
USE chillartrack;

-- Sample Users (password: 'Password123' BCrypt hash)
INSERT IGNORE INTO users (id, name, email, password_hash, role, monthly_budget, weekly_limit, currency, email_verified)
VALUES
('11111111-1111-1111-1111-111111111111', 'Priya Sharma', 'priya@example.com',
 '$2a$12$mQfb4LTGFU0lzW7UVf2KoOsKb2kFbZhNpAONGM5ZrCqV1vJqJfXkm', 'USER', 5000.00, 1500.00, 'INR', TRUE),
('22222222-2222-2222-2222-222222222222', 'Arjun Mehta', 'arjun@example.com',
 '$2a$12$mQfb4LTGFU0lzW7UVf2KoOsKb2kFbZhNpAONGM5ZrCqV1vJqJfXkm', 'USER', 8000.00, 2000.00, 'INR', TRUE),
('33333333-3333-3333-3333-333333333333', 'Admin User', 'admin@chillartrack.app',
 '$2a$12$mQfb4LTGFU0lzW7UVf2KoOsKb2kFbZhNpAONGM5ZrCqV1vJqJfXkm', 'ADMIN', 10000.00, 3000.00, 'INR', TRUE);

-- Sample Transactions for Priya
INSERT IGNORE INTO transactions (id, user_id, amount, category, description, transaction_date, payment_method)
VALUES
('t0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 85.00, 'FOOD_AND_TAPRI', 'Chai and samosa at college tapri', NOW() - INTERVAL 1 DAY, 'CASH'),
('t0000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 200.00, 'TRANSPORT', 'Ola ride to library', NOW() - INTERVAL 2 DAY, 'UPI'),
('t0000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 499.00, 'ENTERTAINMENT', 'Netflix monthly subscription', NOW() - INTERVAL 3 DAY, 'CREDIT_CARD'),
('t0000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 120.00, 'PRINTOUTS_AND_STATIONERY', 'Semester notes printout', NOW() - INTERVAL 4 DAY, 'CASH'),
('t0000001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 350.00, 'FOOD_AND_TAPRI', 'Dinner with friends at mess', NOW() - INTERVAL 5 DAY, 'UPI'),
('t0000001-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 699.00, 'SHOPPING', 'New earphones from Flipkart', NOW() - INTERVAL 6 DAY, 'DEBIT_CARD'),
('t0000001-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 299.00, 'EDUCATION', 'Udemy Python course', NOW() - INTERVAL 7 DAY, 'CREDIT_CARD'),
('t0000001-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 150.00, 'FOOD_AND_TAPRI', 'Zomato order - lunch', NOW() - INTERVAL 8 DAY, 'UPI'),
('t0000001-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 50.00, 'MISCELLANEOUS', 'Bus token refill', NOW() - INTERVAL 9 DAY, 'CASH'),
('t0000001-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 800.00, 'SHOPPING', 'Amazon festive sale haul', NOW() - INTERVAL 12 DAY, 'DEBIT_CARD');

-- Sample Transactions for Arjun
INSERT IGNORE INTO transactions (id, user_id, amount, category, description, transaction_date, payment_method)
VALUES
('t0000002-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 250.00, 'FOOD_AND_TAPRI', 'Biryani at canteen', NOW() - INTERVAL 1 DAY, 'UPI'),
('t0000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 179.00, 'ENTERTAINMENT', 'Movie ticket - IMAX', NOW() - INTERVAL 2 DAY, 'CREDIT_CARD'),
('t0000002-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 1200.00, 'EDUCATION', 'DSA course on Coursera', NOW() - INTERVAL 5 DAY, 'DEBIT_CARD');

-- Sample Savings Goals for Priya
INSERT IGNORE INTO savings_goals (id, user_id, title, target_amount, current_amount, target_date, image_url)
VALUES
('g0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
 'New Laptop 💻', 45000.00, 12500.00, DATE_ADD(CURDATE(), INTERVAL 6 MONTH),
 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
('g0000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
 'Goa Trip 🏖️', 15000.00, 4000.00, DATE_ADD(CURDATE(), INTERVAL 3 MONTH),
 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400'),
('g0000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
 'Concert Tickets 🎵', 5000.00, 5000.00, DATE_ADD(CURDATE(), INTERVAL 1 MONTH),
 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400');

-- Update concert ticket goal as completed
UPDATE savings_goals SET completed = TRUE WHERE id = 'g0000001-0000-0000-0000-000000000003';

-- Sample Achievements for Priya
INSERT IGNORE INTO achievements (id, user_id, badge, description)
VALUES
('a0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
 'GOAL_CRUSHER', 'Completed the Concert Tickets savings goal!'),
('a0000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
 'SMART_SAVER', 'Saved ₹500 in a week');

-- Sample Notifications for Priya
INSERT IGNORE INTO notifications (id, user_id, message, type, `read`)
VALUES
('n0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
 '🏆 New badge earned: Goal Crusher! Completed a savings goal', 'ACHIEVEMENT_EARNED', FALSE),
('n0000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
 '📊 Weekly summary: Spent ₹2,203 this week. You are close to your weekly limit!', 'WEEKLY_SUMMARY', FALSE),
('n0000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
 '🎮 Entertainment spending is 33% of your weekly budget. Keep it under 40%!', 'ENTERTAINMENT_LIMIT', TRUE);
