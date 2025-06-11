import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"

import dogsData from "./data/dogs.json"

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/dogs"
// Connect to MongoDB
mongoose.connect(mongoUrl)

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8081
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

const dogSchema = new mongoose.Schema({
  id: Number,
  name: {
    type: String,
    required: true,
    minlength: 2,
    max_length: 50,
  },
  breed: String,
  age: Number,
  color: String,
  weight_kg: Number,
  vaccinated: Boolean,
})

//const messageSchema = new mongoose.Schema({
// message: {
//   type: String,
//   required: true,
//   minlength: 5,
//   max_length: 140,
// },
// hearts: {
//   type: Number,
//   default: 0,
// },
// category: {
//   type: String,
//   enum:["happy", "family", "friends", "pets", "nature", "funny", "gratitude", "other"],
//   default: "other",
// },
// date: {
//   type: Date,
//   default: Date.now,
// },
// createdBy: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "User",
//   required: true,
// },
//})

// const userSchema = new mongoose.Schema({
//   username: { 
//     type: String,
//     required: true,
//     unique: true,
//     minlength: 3,
//     max_length: 20,
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6,
//     max_length: 50,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     match: /.+\@.+\..+/,
//   },
// })

const Dog = mongoose.model("Dog", dogSchema)

// const Message = mongoose.model("Message", messageSchema)
// const User = mongoose.model("User", userSchema)

// Seed the database with initial data if it's empty
if (process.env.RESET_DATABASE) {
  const seedDatabase = async () => {
    await Dog.deleteMany({}) // Clear existing data
    dogsData.forEach(dog => {
      new Dog(dog).save()
    })
  }
  seedDatabase()
}

// Uncomment the following lines to seed the database with initial data
// if (process.env.RESET_MESSAGES) {
//const seedMessages = async () => {
// await Message.deleteMany({}) // Clear existing messages
// messagesData.forEach(message => {
//   new Message(message).save() 
// })
// }
// seedMessages()
//}



// Start defining your routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Welcome to the Dog API!",
    endpoints: endpoints
  })


})

app.get("/dogs", async (req, res) => {

  const { breed, color, vaccinated } = req.query

  // let filteredDogs = await Dog.find() // Fetch all dogs from the database

  const query = {}
  if (breed) {
    query.breed = breed.toLowerCase()
  }
  if (color) {
    query.color = color.toLowerCase()
  }
  if (vaccinated) {
    query.vaccinated = vaccinated.toLowerCase() === "true"
  }

  try {
    const filteredDogs = await Dog.find(query)
    if (filteredDogs.length === 0) {
      return res.status(404).json({
        success: false,
        response: [],
        message: "No dogs found matching the criteria. Please try different filters."
      })
    }
    res.status(200).json({
      success: true,
      response: filteredDogs,
      message: "Dogs found successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while fetching dogs"
    })

  }

  //hearts and category or day of writing

})

app.get("/dogs/:id", async (req, res) => {
  const { id } = req.params

  try {
    const dog = await Dog.findById(id)

    if (!dog) {
      return res.status(404).json({
        success: false,
        message: "Dog not found"
      })
    }
    res.status(200).json({
      success: true,
      response: dog,
      message: "Dog found successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while fetching the dog"
    })
  }


})

app.post("/dogs", async (req, res) => {
  const { name, breed, color, age, weight_kg, vaccinated } = req.body

  try {
    const newDog = await new Dog({
      name,
      breed,
      color,
      age,
      weight_kg,
      vaccinated
    }).save()
    res.status(201).json({
      success: true,
      response: newDog,
      message: "Dog created successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while creating the dog"
    })
  }
})

app.delete("/dogs/:id", async (req, res) => {
  const { id } = req.params
  try {
    const deletedDog = await Dog.findByIdAndDelete(id)

    if (!deletedDog) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Dog not found"
      })
    }
    res.status(200).json({
      success: true,
      response: deletedDog,
      message: "Dog deleted successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while deleting the dog"
    })
  }
})

app.patch("/dogs/:id", async (req, res) => {
  const { id } = req.params
  const { name, breed, color, age, weight_kg, vaccinated } = req.body //maybe change variable names to newName, newBreed, etc.
  try {
    const updatedDog = await Dog.findByIdAndUpdate(id, {
      name,
      breed,
      color,
      age,
      weight_kg,
      vaccinated
    }, { new: true, runValidators: true })
    if (!updatedDog) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Dog not found"
      })
    }
    res.status(200).json({
      success: true,
      response: updatedDog,
      message: "Dog updated successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while updating the dog"
    })
  }
}
)



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
