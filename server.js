import cors from "cors"
import express from "express"
import dogsData from "./data/dogs.json"

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo! ")
})

app.get("/dogs", (req, res) => {
  res.json(dogsData)
})

app.get("/dogs/:name", (req, res) => {
  const dogName = req.params.name.toLowerCase()
  const dog = dogsData.find(dog => dog.name.toLowerCase() === dogName)

  if (dog) {
    res.json(dog)
  } else {
    res.status(404).json({ error: "Dog not found" })
  }

  res.json(dog)
}

)

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
