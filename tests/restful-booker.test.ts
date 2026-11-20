import { describe, expect, it } from "vitest";
import { ApiClient } from "../src/api/api-client.js";

const client = new ApiClient({
  baseUrl: "https://restful-booker.herokuapp.com",
  maxRetries: 2,
  baseDelayMs: 300
});

describe("Restful Booker API Tests", () => {

  it("should check whether the API is alive", async () => {
    const response = await client.request<string>("/ping");

    expect(response.status).toBe(201);
  });

  it("should retrieve booking IDs", async () => {
    const response = await client.request<
      { bookingid: number }[]
    >("/booking");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it("should retrieve a specific booking", async () => {
    const response = await client.request<{
      firstname: string;
      lastname: string;
      totalprice: number;
    }>("/booking/1");

    expect(response.status).toBe(200);
    expect(response.data.firstname).toBeTruthy();
    expect(response.data.lastname).toBeTruthy();
    expect(typeof response.data.totalprice).toBe("number");
  });

});