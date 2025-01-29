import mongoose from "mongoose";

export default async function mongoDbConfig() {
  const connectionString = "mongodb://localhost:27017/TheCodeFathersDb";

  await mongoose
    .connect(connectionString)
    .then(() => console.log("MongoDb connected."))
    .catch((err) => console.log(err));
}
