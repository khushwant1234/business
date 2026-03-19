import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run seed.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.product.deleteMany(),
  ]);

  await prisma.product.createMany({
    data: [
      {
        name: "DC Geared Motor 12V 100RPM High Torque",
        category: "Motors",
        description:
          "High-torque 12V DC geared motor ideal for robot chassis and low-speed drive systems.\nBuilt with durable metal gears and stable shaft output for classroom and prototyping use.",
        price: 1299,
        imageUrl: "https://placehold.co/400x400/202020/ffffff?text=DC+Motor",
        sku: "MTR-DCG-12V-100RPM",
        isInStock: true,
        brand: "RoboMotion",
        tags: ["dc motor", "geared", "robot chassis", "12v"],
        highlights: [
          "12V operating voltage",
          "100RPM nominal speed",
          "High torque output",
          "Metal gear train",
          "6mm D-shaft",
          "Ideal for robot cars",
        ],
        features: [
          "Stable low-speed output for controlled robotics movement.",
          "Compact profile for easy mounting on educational chassis.",
          "Low maintenance sealed gear assembly.",
        ],
        packageIncludes: [
          "1 x DC Geared Motor",
          "1 x Basic mounting bracket",
        ],
        specifications: {
          Voltage: "12V DC",
          "No-load Speed": "100 RPM",
          Shaft: "6mm D type",
          "Body Material": "Metal + ABS",
          "Approx. Weight": "130g",
        },
        attachments: [
          { name: "Datasheet.pdf", url: "#" },
          { name: "Mounting Guide.pdf", url: "#" },
        ],
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        qna: [
          {
            question: "Can this motor run on a 2S Li-ion battery pack?",
            askedBy: "Aman",
            date: "2026-02-20",
            answer:
              "Yes, a 2S pack is suitable. Ensure your driver can supply enough current and include proper heat handling for prolonged use.",
          },
          {
            question: "Is encoder support available?",
            askedBy: "Sana",
            date: "2026-03-01",
            answer:
              "This listing is for the non-encoder variant. You can pair it with an external wheel encoder module if required.",
          },
        ],
        otherInfo: {
          origin: "India",
          importBy: "Business Robotics Supplies Pvt Ltd",
          address: "42 Innovation Park, Pune, Maharashtra 411045",
          customerCare: {
            phone: "+91-9876543210",
            email: "support@robu.in",
          },
        },
      },
      {
        name: "NEMA 17 Stepper Motor 42BYGH",
        category: "Motors",
        description:
          "Bipolar NEMA 17 motor with 1.8 degree step angle for precision control applications.\nSuitable for CNC, 3D printers, sliders, and robotic positioning systems.",
        price: 1450,
        imageUrl:
          "https://placehold.co/400x400/202020/ffffff?text=Stepper+Motor",
        sku: "MTR-NEMA17-42BYGH",
        isInStock: true,
        brand: "StepDrive",
        tags: ["stepper", "nema17", "cnc", "3d printer"],
        highlights: [
          "1.8 degree step angle",
          "200 steps per revolution",
          "High holding torque",
          "Bipolar winding",
          "Standard NEMA 17 footprint",
        ],
        features: [
          "Consistent step response under moderate load.",
          "Compatible with A4988 and DRV8825 drivers.",
          "Reliable shaft concentricity for linear motion rigs.",
        ],
        packageIncludes: [
          "1 x NEMA 17 Stepper Motor",
          "1 x Connector cable",
        ],
        specifications: {
          "Step Angle": "1.8 degree",
          "Holding Torque": "40 Ncm",
          Current: "1.5A/phase",
          Resistance: "2.1 ohm",
          Weight: "280g",
        },
        attachments: [{ name: "Electrical Specs.pdf", url: "#" }],
        videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        qna: [
          {
            question: "Can this be used with 24V supply?",
            askedBy: "Rahul",
            date: "2026-03-10",
            answer:
              "Yes, with a current-limited stepper driver. Set current as per motor rating to avoid overheating.",
          },
        ],
        otherInfo: {
          origin: "China",
          importBy: "Business Robotics Supplies Pvt Ltd",
          address: "42 Innovation Park, Pune, Maharashtra 411045",
          customerCare: {
            phone: "+91-9876543210",
            email: "support@robu.in",
          },
        },
      },
      {
        name: "HC-SR04 Ultrasonic Sensor",
        category: "Sensors",
        description:
          "Ultrasonic distance measuring sensor with 2cm to 400cm range. Provides non-contact distance measurement with high accuracy. 5V operating voltage.",
        price: 349,
        imageUrl:
          "https://placehold.co/400x400/202020/ffffff?text=Ultrasonic+Sensor",
        sku: "SNS-HCSR04",
        isInStock: true,
      },
      {
        name: "MPU-6050 Gyroscope Accelerometer",
        category: "Sensors",
        description:
          "6-axis motion tracking module combining a 3-axis gyroscope and 3-axis accelerometer. I2C interface. Perfect for drones, balancing robots, and motion detection.",
        price: 599,
        imageUrl: "https://placehold.co/400x400/202020/ffffff?text=MPU-6050",
        sku: "SNS-MPU6050",
        isInStock: false,
      },
      {
        name: "Arduino Uno R3",
        category: "Microcontrollers",
        description:
          "ATmega328P-based microcontroller board with 14 digital I/O pins, 6 analog inputs, USB connection, and 16MHz clock speed. The standard for prototyping.",
        price: 2300,
        imageUrl:
          "https://placehold.co/400x400/202020/ffffff?text=Arduino+Uno",
        sku: "MCU-UNO-R3",
        isInStock: true,
      },
      {
        name: "ESP32 DevKit V1",
        category: "Microcontrollers",
        description:
          "Dual-core 240MHz microcontroller with built-in Wi-Fi and Bluetooth. 30 GPIO pins, 520KB SRAM. Ideal for IoT projects and wireless robotics.",
        price: 899,
        imageUrl: "https://placehold.co/400x400/202020/ffffff?text=ESP32",
        sku: "MCU-ESP32-DV1",
        isInStock: true,
      },
    ],
  });

  console.log("Seeded 6 products with enriched fields successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
