import mongoose from "mongoose";

export default async function mongoDbConfig() {
  const connectionString = process.env.MONGO_DB_CONNECTION_STRING;

  await mongoose
    .connect(connectionString)
    .then(() => console.log("MongoDb connected."))
    .catch((err) => console.log(err));
}
