import { supabase } from "../db/supabaseClient.js"; // Import the function
import variableMapper from "../mapper/variableMapper.json" assert { type: "json" };

export const newTask = async (req, res) => {
  const supabaseClient = supabase();
  const updateData = {};
  const notnullFields = [
    "title",
    "content",
    "assigned_to",
    "assigned_by",
    "deadline",
  ];
  for (const [key, value] of Object.entries(variableMapper.task)) {
    if (req.body[value] !== undefined) {
      updateData[key] = req.body[value];
    }
    if (notnullFields.includes(key) && req.body[value] === undefined) {
      return res.status(400).json({ message: `${key} is required` });
    }
  }
  console.log("Update Data:", updateData);
  try {
    const { data, error } = await supabaseClient
      .from("task")
      .insert({ ...updateData, assigned_by: req.user.user_id });
    if (error) {
      console.error("Error creating task:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(201).json({ message: "Task created successfully", data });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTasks = async (req, res) => {
  const supabaseClient = supabase();
  const { user_id } = req.params;
  try {
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const column = req.user.role === "admin" ? "assigned_by" : "assigned_to";

    const { data, error } = await supabaseClient
      .from("task")
      .select(
        `
    *,
    assigned_by_user:assigned_by (
      user_id,
      username,
      firstname,
      middlename,
      lastname,
      email
    ),
    assigned_to_user:assigned_to (
      user_id,
      username,
      firstname,
      middlename,
      lastname,
      email
    )
  `
      )
      .eq(column, user_id);
    if (error) {
      console.error("Error fetching tasks:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(200).json({ message: "Tasks fetched successfully", data });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllTasks = async (req, res) => {
  const supabaseClient = supabase();
  try {
    const { data, error } = await supabaseClient.from("task").select("*");
    if (error) {
      console.error("Error fetching all tasks:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(200).json({ message: "All tasks fetched successfully", data });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
