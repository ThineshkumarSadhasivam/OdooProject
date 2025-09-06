-- Insert sample listings for demonstration
INSERT INTO listings (user_id, name, description, price, original_price, category, condition, status, image_url, location, views) VALUES
-- These will be assigned to the first user who signs up
((SELECT id FROM auth.users LIMIT 1), 'Vintage Leather Jacket', 'Beautiful vintage leather jacket in excellent condition', 89.99, 120.00, 'Clothing', 'Good', 'Active', '/vintage-leather-jacket.png', 'San Francisco, CA', 45),
((SELECT id FROM auth.users LIMIT 1), 'iPhone 12 Pro', 'iPhone 12 Pro in excellent condition with original box', 599.99, NULL, 'Electronics', 'Excellent', 'Active', '/iphone-12-pro.png', 'San Francisco, CA', 123),
((SELECT id FROM auth.users LIMIT 1), 'Wooden Coffee Table', 'Handcrafted wooden coffee table, perfect for living room', 150.00, NULL, 'Furniture', 'Good', 'Sold', '/wooden-coffee-table.png', 'San Francisco, CA', 67);

-- Insert sample shop products (these will be from different users)
-- Note: In a real scenario, these would be from other users
INSERT INTO listings (user_id, name, description, price, original_price, category, condition, status, image_url, location, views) VALUES
(gen_random_uuid(), 'Bamboo Water Bottle', 'Eco-friendly bamboo water bottle with stainless steel interior', 24.99, 29.99, 'Drinkware', 'New', 'Active', '/bamboo-water-bottle.jpg', 'Portland, OR', 156),
(gen_random_uuid(), 'Organic Cotton Tote Bag', '100% organic cotton tote bag perfect for shopping', 18.50, NULL, 'Bags', 'New', 'Active', '/organic-cotton-tote-bag.png', 'Seattle, WA', 89),
(gen_random_uuid(), 'Solar Power Bank', 'Portable solar power bank with 20,000mAh capacity', 45.00, 55.00, 'Electronics', 'New', 'Active', '/solar-power-bank.png', 'Los Angeles, CA', 203);
