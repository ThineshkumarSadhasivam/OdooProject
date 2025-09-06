-- Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  condition VARCHAR(50),
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for listings
CREATE POLICY "Users can view all active listings" ON public.listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can insert their own listings" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON public.listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON public.listings
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for purchases
CREATE POLICY "Users can view their own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON public.purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON public.purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchases_listing_id ON public.purchases(listing_id);

-- Insert sample data
INSERT INTO public.listings (user_id, title, description, price, category, condition, image_url, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Vintage Leather Jacket', 'Classic brown leather jacket in excellent condition', 89.99, 'Fashion', 'Like New', '/vintage-leather-jacket.png', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Bamboo Water Bottle', 'Eco-friendly bamboo water bottle, 500ml capacity', 24.99, 'Home & Garden', 'New', '/bamboo-water-bottle.jpg', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'Organic Cotton T-Shirt', 'Soft organic cotton t-shirt, size M', 19.99, 'Fashion', 'Good', '/organic-cotton-tshirt.jpg', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'Wooden Phone Stand', 'Handcrafted wooden phone stand for desk', 15.99, 'Electronics', 'Like New', '/wooden-phone-stand.jpg', 'active');
