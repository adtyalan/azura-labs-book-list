import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses seeding database...");

  // Hapus semua data yang ada terlebih dahulu untuk menghindari konflik duplikasi nama unik
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();

  console.log("Membersihkan data lama berhasil.");

  // Membuat 5 Kategori
  const fiksi = await prisma.category.create({
    data: { name: "Fiksi & Sastra" },
  });
  const teknologi = await prisma.category.create({
    data: { name: "Teknologi & Pemrograman" },
  });
  const sains = await prisma.category.create({
    data: { name: "Sains & Matematika" },
  });
  const sejarah = await prisma.category.create({
    data: { name: "Sejarah & Biografi" },
  });
  const bisnis = await prisma.category.create({
    data: { name: "Bisnis & Keuangan" },
  });

  console.log("Berhasil membuat 5 kategori.");

  // Membuat 20 Buku
  const booksData = [
    // Fiksi & Sastra
    {
      title: "Laskar Pelangi",
      author: "Andrea Hirata",
      publicationDate: new Date("2005-09-01"),
      publisher: "Bentang Pustaka",
      numberOfPages: 529,
      categoryId: fiksi.id,
    },
    {
      title: "Bumi Manusia",
      author: "Pramoedya Ananta Toer",
      publicationDate: new Date("1980-08-25"),
      publisher: "Hasta Mitra",
      numberOfPages: 535,
      categoryId: fiksi.id,
    },
    {
      title: "Cantik Itu Luka",
      author: "Eka Kurniawan",
      publicationDate: new Date("2002-03-15"),
      publisher: "Gramedia Pustaka Utama",
      numberOfPages: 508,
      categoryId: fiksi.id,
    },
    {
      title: "Supernova: Ksatria, Puteri, dan Bintang Jatuh",
      author: "Dee Lestari",
      publicationDate: new Date("2001-03-01"),
      publisher: "Truedee Books",
      numberOfPages: 325,
      categoryId: fiksi.id,
    },

    // Teknologi & Pemrograman
    {
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      publicationDate: new Date("2008-08-01"),
      publisher: "Prentice Hall",
      numberOfPages: 464,
      categoryId: teknologi.id,
    },
    {
      title: "The Pragmatic Programmer",
      author: "Andy Hunt & Dave Thomas",
      publicationDate: new Date("1999-10-30"),
      publisher: "Addison-Wesley",
      numberOfPages: 352,
      categoryId: teknologi.id,
    },
    {
      title: "Designing Data-Intensive Applications",
      author: "Martin Kleppmann",
      publicationDate: new Date("2017-03-16"),
      publisher: "O'Reilly Media",
      numberOfPages: 611,
      categoryId: teknologi.id,
    },
    {
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      publicationDate: new Date("2009-07-31"),
      publisher: "MIT Press",
      numberOfPages: 1292,
      categoryId: teknologi.id,
    },

    // Sains & Matematika
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      publicationDate: new Date("1988-04-01"),
      publisher: "Bantam Books",
      numberOfPages: 212,
      categoryId: sains.id,
    },
    {
      title: "Cosmos",
      author: "Carl Sagan",
      publicationDate: new Date("1980-10-12"),
      publisher: "Random House",
      numberOfPages: 365,
      categoryId: sains.id,
    },
    {
      title: "The Selfish Gene",
      author: "Richard Dawkins",
      publicationDate: new Date("1976-10-01"),
      publisher: "Oxford University Press",
      numberOfPages: 360,
      categoryId: sains.id,
    },
    {
      title: "The Elegant Universe",
      author: "Brian Greene",
      publicationDate: new Date("1999-02-01"),
      publisher: "W. W. Norton & Company",
      numberOfPages: 448,
      categoryId: sains.id,
    },

    // Sejarah & Biografi
    {
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      publicationDate: new Date("2011-09-04"),
      publisher: "Harvill Secker",
      numberOfPages: 443,
      categoryId: sejarah.id,
    },
    {
      title: "Guns, Germs, and Steel",
      author: "Jared Diamond",
      publicationDate: new Date("1997-03-01"),
      publisher: "W. W. Norton & Company",
      numberOfPages: 480,
      categoryId: sejarah.id,
    },
    {
      title: "Steve Jobs",
      author: "Walter Isaacson",
      publicationDate: new Date("2011-10-24"),
      publisher: "Simon & Schuster",
      numberOfPages: 656,
      categoryId: sejarah.id,
    },
    {
      title: "Soekarno: Penyambung Lidah Rakyat Indonesia",
      author: "Cindy Adams",
      publicationDate: new Date("1965-01-01"),
      publisher: "Gunung Agung",
      numberOfPages: 418,
      categoryId: sejarah.id,
    },

    // Bisnis & Keuangan
    {
      title: "The Intelligent Investor",
      author: "Benjamin Graham",
      publicationDate: new Date("1949-01-01"),
      publisher: "Harper & Brothers",
      numberOfPages: 640,
      categoryId: bisnis.id,
    },
    {
      title: "Rich Dad Poor Dad",
      author: "Robert T. Kiyosaki",
      publicationDate: new Date("1997-04-01"),
      publisher: "Warner Books",
      numberOfPages: 336,
      categoryId: bisnis.id,
    },
    {
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      publicationDate: new Date("2011-10-25"),
      publisher: "Farrar, Straus and Giroux",
      numberOfPages: 499,
      categoryId: bisnis.id,
    },
    {
      title: "Zero to One",
      author: "Peter Thiel",
      publicationDate: new Date("2014-09-16"),
      publisher: "Crown Business",
      numberOfPages: 224,
      categoryId: bisnis.id,
    },
  ];

  for (const book of booksData) {
    await prisma.book.create({
      data: book,
    });
  }

  console.log("Berhasil membuat 20 buku.");
  console.log("Proses seeding selesai dengan sukses!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
