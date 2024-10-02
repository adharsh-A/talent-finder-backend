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
  const { data } = req.body;
  try {
    const client = await User.update(
      { data },
      { where: { id: req.params.id } }
    );
    res.status(200).json(client);
  } catch (err) {
    res.status(500).json(err);
  }
};
