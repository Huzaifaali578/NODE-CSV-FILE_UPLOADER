import app from "./backend/app.js"
import connectToDB from "./backend/config/db.js"

const port = process.env.PORT | 3000
app.listen(port, async () => {
    console.log(`Server is listening on ${port}`)
    await connectToDB();
})