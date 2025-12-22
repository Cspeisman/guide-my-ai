import { render, screen } from "@testing-library/react";
import { test } from "bun:test";
import { act } from "react";
import { ProfilesList } from "./profiles";

test("Profiles component renders correctly", async () => {
  const profilesPromise = async () => [
    {
      id: "id-1234",
      name: "Profile 1",
      rules: [],
    },
  ];

  await act(async () => {
    render(<ProfilesList profilesPromise={profilesPromise()} />);
  });

  screen.getByText("Profile 1");
});
