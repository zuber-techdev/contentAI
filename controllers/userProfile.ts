import { NextApiResponse } from "next";
import { NextApiRequestWithFile } from "../types/nextApiRequestWithFile";
import { updateUserProfile } from "../services/userService";
import connectToDatabase from "../lib/mongodb";
import { multerMiddleware } from "../middlewares/multerMiddleware";
import { generateToken } from "../utils/jwt";

export async function updateUserProfileHandler(
  req: NextApiRequestWithFile,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    try {
      await connectToDatabase();
      await multerMiddleware(req, res, async () => {
        const { userId } = req.user as { userId: string };
        const { name, email, password } = req.body;
        const profileImage = req.file ? req.file : undefined;
        const updatedProfile: any = await updateUserProfile(userId, {
          name,
          email,
          password,
          profileImage: profileImage?.filename,
        });
        const tokenData = {
          name: updatedProfile.user.name,
          email: updatedProfile.user.email,
          _id: userId,
          userType: updatedProfile.user.userType,
        };
        const token = generateToken(tokenData);
        res.status(200).json({
          message: "Profile updated successfully",
          token,
          profileImage: profileImage ? `/uploads/${profileImage.filename}` : "",
        });
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
