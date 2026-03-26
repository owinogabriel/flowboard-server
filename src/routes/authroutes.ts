import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { Response } from "express";
import db from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";

const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.JWTS_SECRET!, { expiresIn: "7d" });
};

export const register = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing.length) {
      res
        .status(400)
        .json({ success: false, message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db
      .insert(users)
      .values({ name, email, password: hashedPassword })
      .returning();

    const token = generateToken(newUser[0].id);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.userId!));

    if (!result.length) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, data: result[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, avatar } = req.body;

    const updated = await db
      .update(users)
      .set({
        ...(name && { name }),
        ...(avatar && { avatar }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.userId!))
      .returning();

    res.json({
      success: true,
      data: {
        id: updated[0].id,
        name: updated[0].name,
        email: updated[0].email,
        avatar: updated[0].avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
