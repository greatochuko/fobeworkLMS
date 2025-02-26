import { Router } from "express";
import {
  login,
  register,
  getSession,
  logout,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/session", authenticate, getSession);

router.post("/logout", logout);

export default router;
