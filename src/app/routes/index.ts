import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { AdminRoutes } from "../modules/Admin/Admin.routes";
import { SecurityRoutes } from "../modules/security/security.routes";
import { BookingRoutes } from "../modules/Booking/Booking.routes";



const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/security",
    route: SecurityRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
    {
    path: "/booking",
    route: BookingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
