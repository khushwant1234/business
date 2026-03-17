import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run seed.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        name: "DC Geared Motor 12V 100RPM",
        category: "Motors",
        description:
          "High-torque DC geared motor suitable for robotics chassis and drive systems. 12V operating voltage with 100RPM output speed. Metal gears for durability.",
        price: 12.99,
        imageUrl: "https://placehold.co/400x400/202020/ffffff?text=DC+Motor",
      },
      {
        name: "NEMA 17 Stepper Motor",
        category: "Motors",
        description:
          "Bipolar stepper motor with 1.8° step angle. 200 steps per revolution. Ideal for CNC machines, 3D printers, and precision robotic arms.",
        price: 14.5,
        imageUrl:
          "https://placehold.co/400x400/202020/ffffff?text=Stepper+Motor",
      },
      {
        name: "HC-SR04 Ultrasonic Sensor",
        category: "Sensors",
        description:
          "Ultrasonic distance measuring sensor with 2cm to 400cm range. Provides non-contact distance measurement with high accuracy. 5V operating voltage.",
        price: 3.49,
        imageUrl:
          "https://placehold.co/400x400/202020/ffffff?text=Ultrasonic+Sensor",
      },
      {
        name: "MPU-6050 Gyroscope Accelerometer",
        category: "Sensors",
        description:
          "6-axis motion tracking module combining a 3-axis gyroscope and 3-axis accelerometer. I2C interface. Perfect for drones, balancing robots, and motion detection.",
        price: 5.99,
        imageUrl: "https://placehold.co/400x400/202020/ffffff?text=MPU-6050",
      },
      {
        name: "Arduino Uno R3",
        category: "Microcontrollers",
        description:
          "ATmega328P-based microcontroller board with 14 digital I/O pins, 6 analog inputs, USB connection, and 16MHz clock speed. The standard for prototyping.",
        price: 23.0,
        imageUrl:
          "https://placehold.co/400x400/202020/ffffff?text=Arduino+Uno",
      },
      {
        name: "ESP32 DevKit V1",
        category: "Microcontrollers",
        description:
          "Dual-core 240MHz microcontroller with built-in Wi-Fi and Bluetooth. 30 GPIO pins, 520KB SRAM. Ideal for IoT projects and wireless robotics.",
        price: 8.99,
        imageUrl: "https://placehold.co/400x400/202020/ffffff?text=ESP32",
      },
    ],
  });

  console.log("Seeded 6 products successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
