import express from "express";
import mysql from "mysql";
import cors from "cors";
import multer from "multer";
import moment from "moment";

// import path from 'path'
// import fs from 'fs'
// import React from 'react'
// import ReactDOMServer from 'react-dom/server'


// import App from '../src/App'
// // import App from "../client/src/App";

const app = express(); 

// app.get('^/$', (req, res, next) => {
//   fs.readFile(path.resolve('./build/index.html'), 'utf8', (err, data) => {
//     if (err) {
//       console.error(err)
//       return res.status(500).send('An error occurred')
//     }
//     return res.send(
      
//       data.replace(
        
//         '<div id="root"></div>',
//         `<div id="root">${ReactDOMServer.renderToString(<App />)}</div>`
//       )
//     )
//   })`
// }
// )

// app.use(
//   express.static(path.resolve(__dirname, '..', 'build'), { maxAge: '30d' })
// )

app.get('/', (req, res) => {
    res.send("backend")
})


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


const db = mysql.createConnection ({
    host: 'localhost', 
    port: '3306',
    user: "root",
    password : "admin@123",
    database : "test"
})

db.connect((error) => {
  if (error) {
    console.error('MySQL connection error:', error);
    return;
  }
  console.log('Connected to MySQL server');
});


app.use(express.json());
app.use(cors());
app.use("/uploads",express.static("./uploads"));



// user na mate categorylist
app.get("/getactivecategory", (req, res) => {
  const q = "SELECT * FROM category WHERE catecheck = 1 ORDER BY `order`";
  db.query(q, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    let maincategoryresult = [];
    let subcategoryresult = [];

    for (let i = 0; i < data.length; i++) {
      let parentid = data[i].parentid;
      if (parentid > 0) {
        subcategoryresult.push(data[i]);
      } else {
        var obj = {};
        obj["id"] = data[i].id;
        obj["name"] = data[i].title;
        obj["subcategorylist"] = [];
        maincategoryresult.push(obj);
      }
    }

    if (subcategoryresult.length > 0) {
      for (let i = 0; i < maincategoryresult.length; i++) {
        let parentid = maincategoryresult[i].id;
        let subcategorylist = [];
        for (let j = 0; j < subcategoryresult.length; j++) {
          if (parentid == subcategoryresult[j].parentid) {
            var obj = {};
            obj["id"] = subcategoryresult[j].id;
            obj["name"] = subcategoryresult[j].title;
            subcategorylist.push(obj);
          }
        }
        maincategoryresult[i].subcategorylist = subcategorylist;
      }
    }

    // Limit the number of main categories to 6
    maincategoryresult = maincategoryresult.slice(0, 6);

    return res.json(maincategoryresult);
  });
});


//dropdown category fill
app.get("/dropfill", (req, res) => {
  const q = "SELECT id,title FROM category "
  db.query(q,(err,data) => {
    // console.log("backend all data show ",data)
    if(err) return res.json(err)
    return res.json(data)
    
  })
})


// admin insert category
app.post("/admincate", (req, res) => {
  const { title, catecheck } = req.body;

  if (!title) {
    return res.status(422).json({ error: "Please enter a title" });
  }

  const q = "INSERT INTO category (`title`, `catecheck`) VALUES (?, ?)";
  const values = [title, catecheck];
  // console.log("values is the olption", values)

  db.query(q, values, (err, data) => {
    if (err) {
      // console.log(err);
      return res.status(500).json({ error: "Failed to insert data into the category" });
    }

    // console.log("Data is inserted into the category");
    return res.json("Data is inserted into the category");
  });
});



//user category
app.post("/getactivecate", (req, res) => {
  const q = "INSERT INTO category (`title`) VALUES (?)"
  const values = [req.body.title]
  // console.log("values", values)
if (values == "" || !values) {
return res.status(422).json({error: "please not empty field is enter"}) 
}else{
  db.query(q,[values], (err,data) => {
      // console.log("data is the ",data)
      if(err) return res.json(err)
      // console.log("in category data is inserted")
      return res.json("in category data is inserted")
   })
  }
})




app.get("/admin", (req, res) =>{
  const q = "SELECT * FROM admin"
  db.query(q,(err,data) => {
    console.log("backend all data show ",data)
    if(err) return res.json(err)
    return res.json(data)
  })
})


//admin enter the login page
app.post("/admin", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  console.log("email & password", email, password);

  const q = "INSERT INTO admin (`email`, `password`) VALUES ?"; // Note the change in the query


  if (email === "" || password === "") {
    res.status(500).send("Plz enter the data");
  } else {
    const query = `SELECT * FROM admin WHERE email = ?`;
    db.query(query, [email], (error, results) => {
      if (error) {
        console.error("Error querying the database:", error);
        res.status(500).send("An error occurred");
      } else {
        if (results.length > 0) {
          
          if (results[0].password === password) {
            return res.json("Login successful"); 
          } else {
            res.status(401).send("Incorrect password"); 
          }
        } else {
          const values = [[email, password]]; 
          db.query(q, [values], (err, data) => {
            if (err) {
              console.error("Error inserting data into the database:", err);
              return res.status(500).json(err);
            }
            console.log("Data is inserted into the admin table:", data);
            return res.json("Data is inserted into the admin table");
          });
        }
      }
    });
  }
});




app.delete("/admincate/:id", (req, res) => {
  const cateId = req.params.id;
  // console.log(cateId)
  const q = "DELETE FROM category WHERE id = ?"

  db.query(q,[cateId], (err,data) => {
    // console.log("data is the ",data)
    if(err) return res.json(err)
    // console.log("deleted")
    return res.json("deleted")
 })
})
app.put("/admincate/:id", (req, res) => {
  const cateId = req.params.id;
  const { title, catecheck } = req.body;

  // console.log("id is the" , cateId)

  // console.log("values is the ",title, catecheck)
  const q = "UPDATE category SET `title` = ?, `catecheck` = ? WHERE id = ?";
  const values = [title, catecheck, cateId];

  db.query(q, values, (err, data) => {
    if (err) {
      // console.log(err);
      return res.status(500).json({ error: "Failed to update the category" });
    }

    // console.log("Data is updated in the category");
    return res.json("Data is updated in the category");
  });
});

/////////////////////////////////////////////////////////////



  var imgconfig = multer.diskStorage({
    destination:(req,file,callback)=>{
      callback(null,"./uploads");
    },
    filename:(req,file,callback)=>{
      callback(null,`${file.originalname}`);
    }
  })

//img filter
const isImg = (req,file,callback) =>{
    if(file.mimetype.startsWith("image")){
      callback(null,true)
    }else{
      callback(null,Error("only image is allowed"))
    }
}

var upload = multer({
  storage:imgconfig,
  fileFilter:isImg
})
// console.log("upload is images ",upload)


//posted insert data for the admin
app.post("/posted", upload.single("photo"), (req, res) => {
  const { title, author, shortdesc, desc, category, sat, checkbox, metaTitle, metaDescription } = req.body;
  const filename = req.file ? req.file.filename : null;

  // console.log("check box values is the ",checkbox)

  if (!title || !desc || !filename || !sat) {
    res.status(422).json({ status: 422, message: "fill all details" });
    return;
  }

  try {
    let date = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

    db.query("SELECT id FROM category WHERE title = ?", [category], (err, result) => {
      if (err) {
        // console.log("error", err);
        res.status(500).json({ status: 500, message: "Internal server error" });
        return;
      }

      if (result.length === 0) {
        res.status(404).json({ status: 404, message: "Category not found" });
        return;
      }

      const categoryId = result[0].id;

      const post = {
        
        title,
        categoryid: categoryId,
        author,
        image: filename,
        shortdesc,
        desc,
        category,
        sat,
        date,
        checkbox,
        metaTitle,
        metaDescription
      };

      db.query("INSERT INTO post SET ?", post, (err, result) => {
        if (err) {
          // console.log("error", err);
          res.status(500).json({ status: 500, message: "Internal server error" });
        } else {
          // console.log("data added", result);
          res.status(200).json({ message: "post upload successful", result });
        }
      });
    });
  } catch (err) {
    res.status(422).json({ status: 422, err });
  }
});

//all post view 
app.get("/update/:id", (req, res) => {
  const sql = "SELECT * FROM post WHERE id = ?";
  const id =req.params.id;
  db.query(sql,[id], (err,result) => {
    if(err) return res.json({Error : err});
    return res.json(result)
  })
})



//update all post for the admin

app.put("/update/:id", upload.single("photo"), (req, res) => {
  const cateId = req.params.id;
  // console.log("cateID",cateId);

  const { id, title, author, shortdesc, desc, category, sat, checkbox, metatitle, metaDescription } = req.body;
  const filename = req.file ? req.file.filename : null;

  db.query("SELECT id FROM category WHERE title = ?", [category], (err, result) => {
    if (err) {
      // console.log("error", err);
      res.status(500).json({ status: 500, message: "Internal server error" });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ status: 404, message: "Category not found" });
      return;
    }

    try {
      let date = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

      const categoryid = result[0].id;

      // console.log("categoryid is the",categoryid)

      const post = {
        title,
        category_id: categoryid,
        author,
        image: filename,
        shortdesc,
        desc,
        category,
        sat,
        date,
        checkbox,
        metatitle,
        metaDescription
      };

      // Update query based on whether a new file is uploaded
      let query;
      let params;
      if (filename) {
        query = "UPDATE post SET `title`=?, `author`=?, `image`=?, `shortdesc`=?, `desc`=?, `category`=?, `sat`=?, `date`=?, `checkbox`=?, `metatitle`=?, `metaDescription`=?, `category_id`=? WHERE id=?";
        params = [title, author, filename, shortdesc, desc, category, sat, date, checkbox, metatitle, metaDescription, categoryid, cateId];
      } else {
        query = "UPDATE post SET `title`=?, `author`=?, `shortdesc`=?, `desc`=?, `category`=?, `sat`=?, `date`=?, `checkbox`=?,`metatitle`=?, `metaDescription`=?, `category_id`=? WHERE id=?";
        params = [title, author, shortdesc, desc, category, sat, date, checkbox, metatitle, metaDescription, categoryid, cateId];
      }

      db.query(query, params, (err, result) => {
        if (err) {
          // console.log("error", err);
          res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          // console.log("data updated", result);
          res.status(200).json({ message: "post update successful", result });
        }
      });
    } catch (err) {
      res.status(422).json({ status: 422, err });
    }
  });
});





//posted view all for admin
app.get("/posted", (req, res) => {
  try {
    db.query('SELECT id, title, author, image, shortdesc,`desc`, category, sat, checkbox FROM post', (err, results) => {
      if (err) {
        // console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        // console.log("data retrieved");
        res.status(200).json({ status: 200, data: results });
      }
    });
  } catch (err) {
    res.status(503).json({ status: 503, err });
  }
});

app.get("/postedUser", (req, res) => {
  try {
    const titleCharacterLimit = 35; // Adjust the title character limit as needed
    const shortdescCharacterLimit = 170; // Adjust the shortdesc character limit as needed
    
    db.query('SELECT id, LEFT(title, ?) as title, author, image, CONCAT(LEFT(shortdesc, ?),".") as shortdesc, `desc`, category, checkbox FROM post WHERE sat = "publish" AND checkbox = "true" LIMIT 1', [titleCharacterLimit, shortdescCharacterLimit], (err, results) => {
      if (err) {
        // console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        // console.log("data retrieved");
        res.status(200).json({ status: 200, data: results });
      }
    });
  } catch (err) {
    res.status(503).json({ status: 503, err });
  }
});


app.get("/relatedpost", (req, res) => {
  try {    
    db.query('SELECT id, CONCAT(SUBSTRING(title, 1, 44), ".") AS title, checkbox FROM post WHERE sat = "publish" AND checkbox = "true" LIMIT 3 OFFSET 1', (err, results) => {
      if (err) {
        // console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        // console.log("data retrieved");
        res.status(200).json({ status: 200, data: results });
      }
    });
  } catch (err) {
    res.status(503).json({ status: 503, err });
  }
});


app.get("/title", (req, res) => {
  try {
    const titleCharacterLimit = 40; // Adjust the character limit as needed
    
    db.query('SELECT id, CONCAT(LEFT(title, ?), ".") as title, checkbox FROM post WHERE sat = "publish" AND checkbox = "true" LIMIT 4', [titleCharacterLimit], (err, results) => {
      if (err) {
        // console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        // console.log("data retrieved");
        res.status(200).json({ status: 200, data: results });
      }
    });
  } catch (err) {
    res.status(503).json({ status: 503, err });
  }
});


app.get("/deals", (req, res) => {
  try {
    db.query('SELECT id, title, image, author, checkbox FROM post WHERE sat = "publish" AND checkbox = "true" LIMIT 3 OFFSET 1', (err, results) => {
      if (err) {
        // console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        // console.log("data retrieved");
        res.status(200).json({ status: 200, data: results });
      }
    });
  } catch (err) {
    res.status(503).json({ status: 503, err });
  }
});

//card img title
  app.get("/card", (req, res) => {
    try {
      db.query('SELECT id, title, image, checkbox FROM post WHERE sat = "publish" AND checkbox = "true" LIMIT 4 ', (err, results) => {
        if (err) {
          // console.log(err);
          res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          // console.log("data retrieved");
          res.status(200).json({ status: 200, data: results });
        }
      });
    } catch (err) {
      res.status(503).json({ status: 503, err });
    }
  });


  app.get("/mi", (req, res) => {
    try {
      db.query('SELECT id, title, category, image, author, date, CONCAT(SUBSTRING(shortdesc, 1, 255), ".") as shortdesc, `desc`, checkbox FROM post WHERE category = "MI" AND sat = "publish" AND checkbox = "true" LIMIT 4', (err, results) => {
        if (err) {
          // console.log(err);
          res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          // console.log("data retrieved");
          res.status(200).json({ status: 200, data: results });
        }
      });
    } catch (err) {
      res.status(503).json({ status: 503, err });
    }
  });
  
  
//home lenovo category
app.get("/lenovo", (req, res) => {
  try {
    db.query('SELECT id, title, category, image, author, date, shortdesc, `desc`, checkbox FROM post WHERE category = "LENOVO" AND sat = "publish" AND checkbox = "true" LIMIT 4', (err, results) => {
      if (err) {
        // console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        // console.log("data retrieved");
        res.status(200).json({ status: 200, data: results });
      }
    });
  } catch (err) {
    res.status(503).json({ status: 503, err });
  }
});


//xiaomi data
app.get("/xiaomi", (req, res) => {
  try {
    db.query('SELECT id, title, category, image, author, date,  shortdesc, `desc`, checkbox FROM post WHERE category = "XIAOMI" AND sat = "publish" AND checkbox = "true" LIMIT 3', (err, results) => {
      if (err) {
        // console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        // console.log("data retrieved");
        res.status(200).json({ status: 200, data: results });
      }
    });
  } catch (err) {
    res.status(503).json({ status: 503, err });
  }
});

//sasung
app.get("/samsung", (req, res) => {
  try {
    db.query('SELECT id, title, category, image, author, date,  shortdesc, `desc`, checkbox FROM post WHERE category = "SAMSUNG" AND sat = "publish" AND checkbox = "true" LIMIT 4', (err, results) => {
      if (err) {
        // console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        // console.log("data retrieved");
        res.status(200).json({ status: 200, data: results });
      }
    });
  } catch (err) {
    res.status(503).json({ status: 503, err });
  }
});



//delete posted 
app.delete("/posted/:id", (req, res) => {
  const postId = req.params.id;
  // console.log(postId)
  const q = "DELETE FROM post WHERE id = ?"

  db.query(q,[postId], (err,data) => {
    // console.log("data is the ",data)
    if(err) return res.json(err)
    // console.log("data deleted")
    return res.json("data deleted")
 })
})

//single full post

app.get("/selectpost/:id", (req, res) => {

  const postId = req.params.id;
  console.log("post id is the", postId);

  const query = `
    SELECT p.id, p.category_id, p.title, p.author, p.date, p.category, p.desc, p.shortdesc, p.image,
    p.metatitle, p.metaDescription, p.checkbox
    FROM post p
    INNER JOIN category c ON p.category_id = c.id
    WHERE p.id = ${postId} AND p.checkbox = "true" `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Error fetching post' });
    } else {
      if (results.length === 0) {
        // No result found for the provided post ID
        res.status(404).json({ error: 'Post not found' });
      } else {
        const post = results[0];
        res.json(post);
      }
    }
  });
});


//latest 3 blog post related
app.get("/latestblog/:id", (req, res) => {
  const postid = req.params.id;
  // console.log("post id is the id", postid);

 const query = `
  SELECT p.id, p.category_id, p.title, p.author, p.date, 
  p.category, p.desc, p.shortdesc, p.image, p.metatitle, p.metaDescription, p.checkbox
  FROM post p
  INNER JOIN category c ON p.category_id = c.id
  WHERE p.category_id = (
    SELECT category_id
    FROM post
    WHERE id = ${postid}
  )
  AND p.id != ${postid}
  AND p.checkbox = "true"
  LIMIT 3 OFFSET 0`;


  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Error fetching posts' });
    } else {
      if (results.length === 0) {
        // No results found for the provided post ID
        res.status(404).json({ error: 'Data not found' });
      } else {
        const posts = results;
        res.json(posts);
      }
    }
  });
});


// all post fetch
app.get("/post", (req, res) => {
  console.log('-----req.query  -----', req.query);
  const { page, pageSize } = req.query;
  console.log('----- page pageSize -----', page,pageSize);
  const pageNumber = parseInt(page) || 1;
  const pageSizeNumber = parseInt(pageSize) || 2;
  const offset = (pageNumber - 1) * pageSizeNumber;
  console.log('----- offsete -----', offset);

  try {
    const query = `SELECT  shortdesc, id, title, image, author, date FROM post WHERE sat = "publish"
     AND checkbox = "true"
     LIMIT ${pageSizeNumber} OFFSET ${offset}`;
    const countPostsQuery = 'SELECT COUNT(*) AS total FROM post';

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing fetch all posts query:', error);
        res.status(500).json({ error: 'Error executing query' });
      } else {
        // Fetch the total count of posts
        db.query(countPostsQuery, (error, countResult) => {
          if (error) {
            console.error('Error executing count posts query:', error);
            res.status(500).json({ error: 'Error executing query' });
          } else {
            const totalCount = countResult[0].total;
            console.log('----- totalCount -----', totalCount);
            const totalPages = Math.ceil(totalCount / pageSizeNumber);
            console.log('----- totalPages -----', totalPages);
            res.json({ results, totalPages });
          }
        });
      }
    });
  } catch (err) {
    console.error('Error executing fetch all posts:', err);
    res.status(503).json({ error: 'Error executing query' });
  }
});


//allpostcard
app.get("/allpostcard", (req, res) => {
  const { page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const pageSizeNumber = parseInt(pageSize) || 2;
  const offset = (pageNumber - 1) * pageSizeNumber;
  
  try {
    const query = `SELECT id, title, CONCAT(SUBSTRING(shortdesc, 1, 100),".") as shortdesc, image, author, date FROM post WHERE sat = "publish" AND checkbox = "true" LIMIT ${pageSizeNumber} OFFSET ${offset}`;
    const countPostsQuery = 'SELECT COUNT(*) AS total FROM post';

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing fetch all posts query:', error);
        res.status(500).json({ error: 'Error executing query' });
      } else {
        // Fetch the total count of posts
        db.query(countPostsQuery, (error, countResult) => {
          if (error) {
            console.error('Error executing count posts query:', error);
            res.status(500).json({ error: 'Error executing query' });
          } else {
            const totalCount = countResult[0].total;
            const totalPages = Math.ceil(totalCount / pageSizeNumber);
            res.json({ results, totalPages });
          }
        });
      }
    });
  } catch (err) {
    console.error('Error executing fetch all posts:', err);
    res.status(503).json({ error: 'Error executing query' });
  }
});



//specific blog post fetch 
app.get("/categoryPage/:id", (req, res) => {
  const categoryId = req.params.id;
  // console.log("category id is the", categoryId);
  const { page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const pageSizeNumber = parseInt(pageSize) || 2; // Updated pageSizeNumber to 3
  const offset = (pageNumber - 1) * pageSizeNumber;

  const query = `
    SELECT p.id, p.category_id, p.title, p.author, p.date, p.category, p.desc, shortdesc, p.image, p.checkbox
    FROM post p
    INNER JOIN category c ON p.category_id = c.id
    WHERE c.id = ${categoryId} AND p.checkbox = "true" AND p.sat = "publish"
    LIMIT ${pageSizeNumber} OFFSET ${offset}`;

  const countPostsQuery = `SELECT COUNT(*) AS total FROM post WHERE category_id = ${categoryId} AND checkbox = "true" AND sat = "publish"`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error executing fetch all posts query:', error);
      res.status(500).json({ error: 'Error executing query' });
    } else {
      // Fetch the total count of posts for the specific category
      db.query(countPostsQuery, (error, countResult) => {
        if (error) {
          console.error('Error executing count posts query:', error);
          res.status(500).json({ error: 'Error executing query' });
        } else {
          const totalCount = countResult[0].total;
          const totalPages = Math.ceil(totalCount / pageSizeNumber);

          res.json({ results, totalPages });
        }
      });
    }
  });
});




//fetch id using to category related subcategory data 
app.get("/categoryRelatedSubcategoryPost/:id", (req, res) => {
  const categoryId = req.params.id;
  // console.log("category id is", categoryId);

  const query = `
    SELECT p.id, p.category_id, p.title, p.author, p.date, p.category, p.desc, 
          shortdesc, p.image, p.checkbox
    FROM post p
    INNER JOIN category c ON p.category_id = c.id 
    WHERE c.parentid = ? AND p.checkbox = "true" LIMIT 3`;

  db.query(query, [categoryId], (error, results) => {
    if (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Error fetching posts' });
    } else {
      if (results.length === 0) {
        // No results found for the provided categoryId
        res.status(401).json({ error: 'Data not found' });
      } else {
        res.json(results);
      }
    }
  });
});





//specific blog post fetch to subcategory
app.get("/subcategoryPage/:id", (req, res) => {
  const Cateid = req.params.id;
// console.log("category id is", Cateid);


  const query = `
    SELECT p.id, p.category_id, p.title, p.author, p.date, p.category, p.desc, p.shortdesc, p.image, p.checkbox
    FROM post p
    INNER JOIN category c ON p.category_id = c.id
    WHERE c.id = ${Cateid} AND p.checkbox = "true" LIMIT 2`;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
      } else {
        if (results.length === 0) {
          // No results found for the provided categoryId
          res.status(401).json({ error: 'Data not found' });
        } else {
          res.json(results);
        }
      }
    });
});


//search user anything
app.get("/searchpage", (req, res) => {
  const searchTerm = req.query.q;
  const { page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const pageSizeNumber = parseInt(pageSize) || 2;
  const offset = (pageNumber - 1) * pageSizeNumber;

  // console.log("searchTerm is the name ", searchTerm);
  const query = `
    SELECT p.id, p.category_id, p.title, p.author, p.date,
      p.category, p.desc, p.shortdesc, SUBSTRING(p.shortdesc, 1, 80) AS shortdesc, p.image, p.checkbox
    FROM post p
    INNER JOIN category c ON p.category_id = c.id
    WHERE (p.title LIKE '%${searchTerm}%'
        OR p.category LIKE '%${searchTerm}%'
        OR p.desc LIKE '%${searchTerm}%'
        OR p.shortdesc LIKE '%${searchTerm}%')
        AND p.checkbox = 'true'
    LIMIT ${pageSizeNumber} OFFSET ${offset}`;

  const countPostsQuery = `
    SELECT COUNT(*) AS total
    FROM post
    WHERE (title LIKE '%${searchTerm}%'
        OR category LIKE '%${searchTerm}%'
        OR \`desc\` LIKE '%${searchTerm}%'
        OR shortdesc LIKE '%${searchTerm}%')
        AND checkbox = 'true'`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error executing fetch all posts query:', error);
      res.status(500).json({ error: 'Error executing query' });
    } else {
      // Fetch the total count of posts
      db.query(countPostsQuery, (error, countResult) => {
        if (error) {
          console.error('Error executing count posts query:', error);
          res.status(500).json({ error: 'Error executing query' });
        } else {
          const totalCount = countResult[0].total;
          const totalPages = Math.ceil(totalCount / pageSizeNumber);

          res.json({ results, totalPages });
        }
      });
    }
  });
});

// admin get category 
app.get("/admincate", (req, res) => {
  const { page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;

  // console.log("number",pageNumber)
  const pageSizeNumber = parseInt(pageSize) || 2;
  // console.log("pasizenumber",pageSizeNumber)
  const offset = (pageNumber - 1) * pageSizeNumber;
  // console.log(offset)
  try {
  const query = `SELECT * FROM category LIMIT ${pageSizeNumber} OFFSET ${offset}`;
  const countPostsQuery = 'SELECT COUNT(*) AS total FROM category';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error executing fetch all posts query:', error);
      res.status(500).json({ error: 'Error executing query' });
    } else {
      // Fetch the total count of posts
      db.query(countPostsQuery, (error, countResult) => {
        if (error) {
          console.error('Error executing count posts query:', error);
          res.status(500).json({ error: 'Error executing query' });
        } else {
          const totalCount = countResult[0].total;
          const totalPages = Math.ceil(totalCount / pageSizeNumber);
          res.json({ results, totalPages });
        }
      });
    }
  });
}
catch (err) {
  console.error('Error executing fetch all posts:', err);
  res.status(503).json({ error: 'Error executing query' });
}
})


//pagination of the post
app.get('/posts', (req, res) => {
  const { page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const pageSizeNumber = parseInt(pageSize) || 2; // Update pageSizeNumber to 4
  const offset = (pageNumber - 1) * pageSizeNumber;

  // Fetch all posts from the database with pagination
  const fetchAllPostsQuery = `SELECT * FROM post LIMIT ${pageSizeNumber} OFFSET ${offset}`;
  const countPostsQuery = 'SELECT COUNT(*) AS total FROM post';

  db.query(fetchAllPostsQuery, (error, results) => {
    if (error) {
      console.error('Error executing fetch all posts query:', error);
      res.status(500).json({ error: 'Error executing query' });
    } else {
      // Fetch the total count of posts
      db.query(countPostsQuery, (error, countResult) => {
        if (error) {
          console.error('Error executing count posts query:', error);
          res.status(500).json({ error: 'Error executing query' });
        } else {
          const totalCount = countResult[0].total;
          const totalPages = Math.ceil(totalCount / pageSizeNumber);

          res.json({ results, totalPages });
        }
      });
    }
  });
});





