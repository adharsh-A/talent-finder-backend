import User from "../models/user.js";


export const getAllClients = async (req, res) => {
  try {
    const clients = await User.findAll({
      attributes: { exclude: ["password"] }, // Exclude the password column
    });

    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getClientById = async (req, res) => {
  console.log(req.params.id);
  try {
    const client = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    res.status(200).json(client);
  } catch (err) {
    res.status(500).json(err);
  }
};


export const clientProfile = async (req, res) => {
  const { name, username, clientCompany, companyLocation, clientContactEmail, clientWebsite, clientContactPhone } = req.body;

  try {
    // Find the existing user data
    const user = await User.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ message: "Client not found!" });
    }

    // Merge the existing data with the new data from the request
    const updatedData = {
      name: name || user.name, // Use the new name or keep the old one
      username: username || user.username, // Use the new username or keep the old one
      data: {
        clientCompany: clientCompany || user.data.clientCompany, // Update only if a new value is provided
        companyLocation: companyLocation || user.data.companyLocation,
        clientContactEmail: clientContactEmail || user.data.clientContactEmail,
        clientWebsite: clientWebsite || user.data.clientWebsite,
        clientContactPhone: clientContactPhone || user.data.clientContactPhone,
      },
    };

    // Update the user with merged data
    const [updated] = await User.update(updatedData, { where: { id: req.params.id } });

    // If the update is successful, return the updated client data
    if (updated) {
      const updatedClient = await User.findOne({ where: { id: req.params.id } });
      return res.status(200).json(updatedClient);
    }

    // If the update fails (no rows were affected), return an error
    return res.status(404).json({ message: "Client not found!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
