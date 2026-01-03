/**
 * Test constants and configuration values
 */

/**
 * Default test user credentials
 * This user is created in global-setup.ts before all tests run
 */
export const TEST_USER = {
  name: "Test User",
  email: "test@example.com",
  password: "testpassword123",
} as const;
