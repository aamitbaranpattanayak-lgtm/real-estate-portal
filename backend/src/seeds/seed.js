require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Property = require("../models/Property");

const seedProperties = async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      console.log("❌ Admin user not found");
      process.exit(1);
    }

    await Property.deleteMany();

    const properties = [
      {
        title: "Spacious 2BHK Flat in Whitefield",
        description:
          "A well-ventilated 2BHK flat located in the heart of Whitefield, Bengaluru. Close to IT parks, schools, and shopping malls, this flat offers modern amenities including 24/7 security, power backup, and covered parking. Ideal for small families and working professionals.",
        purpose: "sale",
        propertyType: "flat",
        price: 6500000,
        address: "12th Cross, Whitefield",
        city: "Bengaluru",
        state: "Karnataka",
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
        ownerName: "Ramesh Kumar",
        ownerEmail: "ramesh.kumar@example.com",
        ownerPhone: "9876543210",
        featured: true,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Cozy 1BHK Flat Near Andheri Station",
        description:
          "Compact and affordable 1BHK flat, perfect for bachelors or small families. Located within walking distance of Andheri railway station, with easy access to markets, hospitals, and public transport. Comes with modular kitchen fittings and ample natural light.",
        purpose: "rent",
        propertyType: "flat",
        price: 28000,
        address: "SV Road, Andheri West",
        city: "Mumbai",
        state: "Maharashtra",
        bedrooms: 1,
        bathrooms: 1,
        area: 550,
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop",
        ownerName: "Suresh Shah",
        ownerEmail: "suresh.shah@example.com",
        ownerPhone: "9823456712",
        featured: false,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Modern 3BHK Flat in Gachibowli",
        description:
          "Premium 3BHK flat situated in the tech corridor of Gachibowli, Hyderabad. Offers a clubhouse, swimming pool, gym, and landscaped gardens within the gated community. Excellent connectivity to IT hubs and the outer ring road.",
        purpose: "sale",
        propertyType: "flat",
        price: 9800000,
        address: "Nanakramguda Road, Gachibowli",
        city: "Hyderabad",
        state: "Telangana",
        bedrooms: 3,
        bathrooms: 3,
        area: 1650,
        image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&auto=format&fit=crop",
        ownerName: "Anita Reddy",
        ownerEmail: "anita.reddy@example.com",
        ownerPhone: "9012345678",
        featured: false,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Affordable 2BHK Flat in Kharadi",
        description:
          "Well-designed 2BHK flat in the rapidly developing Kharadi locality of Pune. Close to EON IT Park, restaurants, and schools. The society offers a children's play area, jogging track, and dedicated visitor parking.",
        purpose: "rent",
        propertyType: "flat",
        price: 22000,
        address: "Wagholi Road, Kharadi",
        city: "Pune",
        state: "Maharashtra",
        bedrooms: 2,
        bathrooms: 2,
        area: 950,
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
        ownerName: "Vikram Joshi",
        ownerEmail: "vikram.joshi@example.com",
        ownerPhone: "9765432180",
        featured: false,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Elegant 3BHK Apartment in Patia",
        description:
          "A beautifully designed 3BHK apartment located in the fast-growing Patia area of Bhubaneswar, close to IT companies and educational institutions. Features include a dedicated study room, balcony views, and 24-hour water supply.",
        purpose: "sale",
        propertyType: "apartment",
        price: 7200000,
        address: "Patia Main Road",
        city: "Bhubaneswar",
        state: "Odisha",
        bedrooms: 3,
        bathrooms: 2,
        area: 1450,
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
        ownerName: "Debasis Mohanty",
        ownerEmail: "debasis.mohanty@example.com",
        ownerPhone: "9437123456",
        featured: false,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Sea-View Apartment in Candolim",
        description:
          "A stunning apartment offering partial sea views, located just minutes away from Candolim Beach, Goa. Perfect as a vacation home or rental investment, with access to a community pool and landscaped courtyard.",
        purpose: "rent",
        propertyType: "apartment",
        price: 45000,
        address: "Fort Aguada Road, Candolim",
        city: "Candolim",
        state: "Goa",
        bedrooms: 2,
        bathrooms: 2,
        area: 1050,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
        ownerName: "Maria Fernandes",
        ownerEmail: "maria.fernandes@example.com",
        ownerPhone: "9822098765",
        featured: false,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Luxurious 4BHK Villa in South Delhi",
        description:
          "An exquisite 4BHK villa nestled in a quiet, upscale neighborhood of South Delhi. Boasts a private garden, terrace lounge, home theatre room, and premium Italian marble flooring throughout. A rare find for discerning buyers.",
        purpose: "sale",
        propertyType: "villa",
        price: 45000000,
        address: "Vasant Vihar",
        city: "New Delhi",
        state: "Delhi",
        bedrooms: 4,
        bathrooms: 5,
        area: 4200,
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop",
        ownerName: "Arjun Malhotra",
        ownerEmail: "arjun.malhotra@example.com",
        ownerPhone: "9811223344",
        featured: true,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Royal Heritage Villa in Civil Lines",
        description:
          "A majestic villa with Rajasthani architectural touches, located in the prestigious Civil Lines area of Jaipur. Features intricate jharokha windows, a private courtyard, and expansive lawns, blending heritage charm with modern comfort.",
        purpose: "rent",
        propertyType: "villa",
        price: 85000,
        address: "Civil Lines",
        city: "Jaipur",
        state: "Rajasthan",
        bedrooms: 4,
        bathrooms: 4,
        area: 3800,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
        ownerName: "Kavita Singh",
        ownerEmail: "kavita.singh@example.com",
        ownerPhone: "9414567890",
        featured: false,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Charming Bungalow in Adyar",
        description:
          "A well-maintained independent bungalow in the leafy, upscale locality of Adyar, Chennai. Offers a private driveway, garden space, and traditional Chettinad-style interiors, ideal for large families seeking privacy and comfort.",
        purpose: "sale",
        propertyType: "bungalow",
        price: 32000000,
        address: "Gandhi Nagar, Adyar",
        city: "Chennai",
        state: "Tamil Nadu",
        bedrooms: 3,
        bathrooms: 3,
        area: 2800,
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop",
        ownerName: "Lakshmi Narayanan",
        ownerEmail: "lakshmi.n@example.com",
        ownerPhone: "9884123456",
        featured: false,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Colonial-Style Bungalow in Alipore",
        description:
          "A graceful colonial-era bungalow located in the tree-lined streets of Alipore, Kolkata. Retains original wooden flooring and high ceilings, complemented by a modernized kitchen and bathrooms. A perfect blend of old-world charm and present-day comfort.",
        purpose: "rent",
        propertyType: "bungalow",
        price: 60000,
        address: "Alipore Road",
        city: "Kolkata",
        state: "West Bengal",
        bedrooms: 3,
        bathrooms: 3,
        area: 2600,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop",
        ownerName: "Sourav Chatterjee",
        ownerEmail: "sourav.chatterjee@example.com",
        ownerPhone: "9830045678",
        featured: false,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Independent House in Sector 44",
        description:
          "A spacious independent house in a well-planned residential sector of Chandigarh. Features a rooftop terrace, dedicated parking for two cars, and proximity to markets, schools, and parks, ideal for growing families.",
        purpose: "sale",
        propertyType: "house",
        price: 18500000,
        address: "Sector 44",
        city: "Chandigarh",
        state: "Chandigarh",
        bedrooms: 3,
        bathrooms: 3,
        area: 2200,
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop",
        ownerName: "Harpreet Sandhu",
        ownerEmail: "harpreet.sandhu@example.com",
        ownerPhone: "9888012345",
        featured: false,
        listedBy: admin._id,
        status: "available",
      },
      {
        title: "Premium Office Space in Cyber Hub",
        description:
          "A modern, fully furnished commercial office space located in the bustling Cyber Hub business district of Gurugram. Ideal for startups and established firms alike, with high-speed connectivity, conference rooms, and 24/7 access.",
        purpose: "rent",
        propertyType: "commercial",
        price: 150000,
        address: "DLF Cyber City",
        city: "Gurugram",
        state: "Haryana",
        bedrooms: 0,
        bathrooms: 2,
        area: 3000,
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
        ownerName: "Rohit Bansal",
        ownerEmail: "rohit.bansal@example.com",
        ownerPhone: "9899876543",
        featured: true,
        listedBy: admin._id,
        status: "available",
      },
    ];

    await Property.insertMany(properties);

    console.log("✅ Seeded 12 Properties Successfully");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding properties:", error);
    process.exit(1);
  }
};

seedProperties();