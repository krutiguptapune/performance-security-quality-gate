import http from "k6/http";
import { check, sleep } from "k6";

export const options = {

  stages: [
    { duration: "5s", target: 1 },
    { duration: "15s", target: 2 },
    { duration: "20s", target: 2 },
    { duration: "5s", target: 0 }
  ],

  discardResponseBodies: true,

  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"]
  }

};

const BASE_URL = "https://restful-booker.herokuapp.com";

export default function () {

  const response = http.get(`${BASE_URL}/booking`);

  check(response, {
    "status code is 200": (r) => r.status === 200,
    "response has a valid status": (r) => r.status === 200
  });

  sleep(1);

}