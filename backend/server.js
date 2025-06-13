import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"

import dogsData from "./data/dogs.json"

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/thoughts-api"
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

// const dogSchema = new mongoose.Schema({
//   id: Number,
//   name: {
//     type: String,
//     required: true,
//     minlength: 2,
//     max_length: 50,
//   },
//   breed: String,
//   age: Number,
//   color: String,
//   weight_kg: Number,
//   vaccinated: Boolean,
// })

const thoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    max_length: 140,
  },
  hearts: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    enum: ["happy", "family", "friends", "pets", "nature", "funny", "gratitude", "other"],
    default: "other",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    max_length: 20,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    max_length: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
})

const Thought = mongoose.model("Thought", thoughtSchema)
const User = mongoose.model("User", userSchema)

if (process.env.RESET_THOUGHTS) {
  const seedThoughts = async () => {
    await Thought.deleteMany({}) // Clear existing messages
    thoughtsData.forEach(thought => {
      new Thought(thought).save()
    })
  }
  seedThoughts()
}


app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Welcome to the Happy thoughts API",
    endpoints: endpoints
  })
})

app.get("/thoughts", async (req, res) => {
  const { message, hearts, category, date } = req.query
  let query = {}
  if (message) {
    query.message = message.toLowerCase()
  }
  if (hearts) {
    query.hearts = hearts
  }
  if (category) {
    query.category = category.toLowerCase()
  }
  if (date) {
    query.date = { $gte: new Date(date) }
  }
  try {
    const filteredThoughts = await Thought.find(query)
    if (filteredThoughts.length === 0) {
      return res.status(404).json({
        success: false,
        response: [],
        message: "No messages found matching the criteria. Please try different filters."
      })
    }
    res.status(200).json({
      success: true,
      response: filteredThoughts,
      message: "Messages found successfully"
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while fetching messages"
    })
  }
})


app.get("/thoughts/:id", async (req, res) => {
  const { id } = req.params

  try {
    const thought = await Thought.findById(id)

    if (!thought) {
      return res.status(404).json({
        success: false,
        message: "Thought not found"
      })
    }
    res.status(200).json({
      success: true,
      response: thought,
      message: "Thought found successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while fetching the thought"
    })
  }
})


app.post("/thoughts", async (req, res) => {
  const { message, hearts, category, date, createdBy } = req.body

  try {
    const newThought = await new Thought({
      message,
      hearts,
      category,
      date,
      createdBy
    }).save()
    res.status(201).json({
      success: true,
      response: newThought,
      message: "Thought created successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while creating the thought"
    })
  }
})

app.delete("/thoughts/:id", async (req, res) => {
  const { id } = req.params
  try {
    const deletedThought = await Thought.findByIdAndDelete(id)

    if (!deletedThought) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Thought not found"
      })
    }
    res.status(200).json({
      success: true,
      response: deletedThought,
      message: "Thought deleted successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while deleting the thought"
    })
  }
})

app.patch("/thoughts/:id", async (req, res) => {
  const { id } = req.params
  const { message, hearts, category, date, createdBy } = req.body //maybe change variable names to newMessage, newHearts, etc.
  try {
    const updatedThought = await Thought.findByIdAndUpdate(id, {
      message,
      hearts,
      category,
      date,
      createdBy
    }, { new: true, runValidators: true })
    if (!updatedThought) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Thought not found"
      })
    }
    res.status(200).json({
      success: true,
      response: updatedThought,
      message: "Thought updated successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "An error occurred while updating the thought"
    })
  }
})



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
