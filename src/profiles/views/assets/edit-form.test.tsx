import { render, screen } from "@testing-library/react";
import { test } from "bun:test";
import { act } from "react";
import { Profile } from "../../profile";
import { EditFormView } from "./edit-form";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

test("loads and displays the profile title", async () => {
  const mockProfile = new Profile(
    "test-id",
    "My Test Profile",
    "my-test-profile",
    "user-123",
    new Date(),
    new Date(),
    [],
    []
  );

  const mockGetProfile = async () => mockProfile;
  const emotionCache = createCache({ key: "test", container: document.head });

  await act(async () => {
    render(
      // provider is needed render react-select components
      <CacheProvider value={emotionCache}>
        <EditFormView slug="my-test-profile" getProfile={mockGetProfile} />
      </CacheProvider>
    );
  });

  // Assert that the profile title is displayed
  await screen.findByText("My Test Profile");
});
