-- Add MetaMask wallet address to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS metamask_wallet_address TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_metamask_wallet 
ON user_profiles(metamask_wallet_address) 
WHERE metamask_wallet_address IS NOT NULL;

-- Add comment
COMMENT ON COLUMN user_profiles.metamask_wallet_address IS 'Ethereum wallet address from MetaMask connection';

