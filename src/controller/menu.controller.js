const Menu = require("../model/menu.model");

exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, category, currency } = req.body;
    // const price = Number(req.body.price);
    // const available = req.body.available === "true";
    const rawPrice = req.body.price?.replace(/[^\d.]/g, "");
    const price = Number(rawPrice);
    const available = ["true", "1", "yes", true].includes(
      String(req.body.available).toLowerCase()
    );

    const image = req.file
      ? req.file.path.replace(/^.*uploads[\\/]/, "uploads/").replace(/\\/g, "/")
      : "";

    const item = new Menu({
      name,
      description,
      price,
      category,
      available,
      image,
      currency: currency || "NGN",
    });

    await item.save();

    res.status(201).json({ message: "Menu item created", item });
  } catch (err) {
    console.error("Create menu item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAllMenuItems = async (req, res) => {
  try {
    const { search, category, available } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = { $regex: new RegExp(category, "i") }; // case-insensitive match
    }

    if (available !== undefined) {
      query.available = available === "true";
    }

    const menuItems = await Menu.find(query).sort({ createdAt: -1 }); // apply sorting to filtered results

    res.status(200).json({ menu: menuItems });
  } catch (err) {
    console.error("Fetch menu items error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getMenuItemById = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.status(200).json({ item });
  } catch (err) {
    console.error("Fetch item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Menu item deleted" });
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const rawPrice = req.body.price?.replace(/[^\d.]/g, "");
    const price = Number(rawPrice);
    const available = ["true", "1", "yes", true].includes(
      String(req.body.available).toLowerCase()
    );
    // const price = Number(req.body.price);
    // const available = req.body.available === "true";
    // const image = req.file ? req.file.path.replace(/^.*uploads[\\/]/, "uploads/") : "";
    const image = req.file
      ? req.file.path.replace(/^.*uploads[\\/]/, "uploads/").replace(/\\/g, "/")
      : "";

    const updatedFields = {
      name,
      description,
      price,
      category,
      available,
    };

    if (image) updatedFields.image = image;

    const item = await Menu.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true,
    });

    res.status(200).json({ message: "Menu item updated", item });
  } catch (err) {
    console.error("Update item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
