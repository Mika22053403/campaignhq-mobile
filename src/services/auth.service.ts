import { LoginPayload, LoginResponse, SignupPayload } from "@/types/auth";

/**
 * Mirrors the mock API behaviour used by the CampaignHQ web app
 * (mocks/handlers/auth.ts). Swap the bodies of these functions for
 * real `axios`/`fetch` calls once a backend is available - the
 * payload/response shapes already match `types/auth.ts` on the web app.
 */
const DEMO_EMAIL = "admin@campaignhq.com";
const DEMO_PASSWORD = "password123";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    await delay(600);

    if (payload.email !== DEMO_EMAIL || payload.password !== DEMO_PASSWORD) {
      throw new Error("Invalid email or password");
    }

    return {
      token: "campaignhq-token",
      user: {
        id: "1",
        name: "Admin User",
        email: DEMO_EMAIL,
      },
    };
  },

  async signup(payload: SignupPayload): Promise<LoginResponse> {
    await delay(600);

    return {
      token: "campaignhq-token",
      user: {
        id: "2",
        name: payload.companyName || "New Workspace",
        email: payload.workEmail || "new.user@campaignhq.com",
      },
    };
  },
};
