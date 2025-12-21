import { render, screen } from "@testing-library/react";
import { test } from "bun:test";
import React, { act } from "react";
import { ProfilesList } from "./Profiles";

test("Profiles component renders correctly", async () => {
  const profilesPromise = async () => [
    {
      name: "Profile 1",
      rules: [],
    },
  ];

  await act(async () => {
    render(<ProfilesList profilesPromise={profilesPromise()} />);
  });

  screen.getByText("Profile 1");
});
