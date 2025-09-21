import { supabase } from "../db/supabaseClient.js"; // Import the function
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import variableMapper from "../mapper/variableMapper.json" assert { type: "json" };

export const insertRecord = async (req, res) => {
  const supabaseClient = supabase(); // Call the function to get the client
  const updateData = {};
  const notnullFields = [
    "username",
    "email",
    "password",
    "firstname",
    "lastname",
  ];

  console.log(req.body);
  for (const [key, value] of Object.entries(variableMapper.userData)) {
    if (
      req.body[value] !== undefined ||
      req.body[value] === null ||
      req.body[value] === ""
    ) {
      updateData[key] = req.body[value];
    }
    if (notnullFields.includes(key) && !req.body[value]) {
      return res.status(400).json({ message: `${key} is required` });
    }
  }

  const salt = bcrypt.genSaltSync(10);
  updateData.password = bcrypt.hashSync(updateData.password, salt);
  console.log(updateData);
  try {
    const { data, error } = await supabaseClient
      .from("userData")
      .insert(updateData);

    if (error) {
      console.error("Error inserting record:", error);
      throw error;
    }

    res.status(200).json({ message: "Record inserted successfully", data });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRecords = async (req, res) => {
  const supabaseClient = supabase(); // Call the function to get the client
  try {
    const { data, error } = await supabaseClient.from("userData").select("*");

    if (error) {
      console.error("Error fetching records:", error);
      throw error;
    }

    res.status(200).json({ message: "Records fetched successfully", data });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  const supabaseClient = supabase(); // Call the function to get the client
  const { loginid, password } = req.body; // Get email and password from request body
  try {
    const { data, error } = await supabaseClient
      .from("userData")
      .select("*")
      .or(`email.eq.${loginid},username.eq.${loginid}`)
      .single();

    if (error) {
      console.error("Error logging in:", error);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = bcrypt.compareSync(password, data.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: data.email, role: data.role, user_id: data.user_id },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({
        message: "Login successful",
        token,
        data: {
          username: data.username,
          email: data.email,
          firstname: data.firstname,
          middlename: data.middlename,
          lastname: data.lastname,
          address: data.address,
          phone_number: data.phone_number,
          role: data.role,
          user_id: data.user_id,
        },
      });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateRecord = async (req, res) => {
  const supabaseClient = supabase();
  const { user_id } = req.params;

  try {
    // ---------- 1️⃣ Bulk role update (no params) ----------
    if (!user_id) {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admins can update roles" });
      }

      if (!Array.isArray(req.body)) {
        return res
          .status(400)
          .json({ message: "Body must be an array of { user_id, role }" });
      }

      const results = [];
      for (const item of req.body) {
        if (!item.user_id || !item.role) {
          results.push({
            user_id: item.user_id || null,
            success: false,
            error: "Missing user_id or role",
          });
          continue;
        }

        const { data, error } = await supabaseClient
          .from("userData")
          .update({ role: item.role })
          .eq("user_id", item.user_id);

        if (error) {
          results.push({
            user_id: item.user_id,
            success: false,
            error: error.message,
          });
        } else {
          results.push({ user_id: item.user_id, success: true, data });
        }
      }

      return res
        .status(200)
        .json({ message: "Roles update completed", results });
    }

    // ---------- 2️⃣ User updating their own profile ----------
    if (user_id !== req.user.user_id) {
      return res
        .status(403)
        .json({ message: "You can only update your own profile" });
    }

    if (Array.isArray(req.body)) {
      return res
        .status(400)
        .json({
          message: "Cannot update multiple profiles in a single request",
        });
    }

    const updateData = {};
    for (const [key, value] of Object.entries(variableMapper.userData)) {
      if (req.body[value] !== undefined) {
        updateData[key] = req.body[value];
      }
    }

    const allowed = ["middlename", "address", "phone_number", "password"];
    if (Object.keys(updateData).some((k) => !allowed.includes(k))) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update these fields" });
    }

    if (req.body.password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(req.body.password, salt);
    }

    const { data: updatedData, error } = await supabaseClient
      .from("userData")
      .update(updateData)
      .eq("user_id", user_id);

    if (error) throw error;

    return res.status(200).json({ message: "Profile updated", updatedData });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getprofile = async (req, res) => {
  const supabaseClient = supabase(); // Call the function to get the client
  try {
    if (req.user.user_id !== req.params.user_id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to access this profile" });
    }
    const { data, error } = await supabaseClient
      .from("userData")
      .select(
        "username,email,firstname,middlename,lastname,address,phone_number,role,user_id"
      )
      .eq("user_id", req.params.user_id)
      .single();
    if (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(200).json({ message: "Profile fetched successfully", data });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
