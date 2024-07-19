


https://github.com/user-attachments/assets/b3a7cab4-41ec-47be-a358-249df16a4232



# Fractionalised Node License Platform

# Getting Started

At the root of the project, run

```bash
npm install
```

Then you need to setup the DB and Prisma. Run

Get a db url from [NeonDB](https://neon.tech)

In the `.env` file, enter the following
```bash
DATABASE_URL=""
```
## Generate Prisma schema 

In the terminal, run

```bash
npx prisma generate
```
## Run the server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

# Deployed Contract

The contract is deployed using Remix in the 
[Sepolia Network](https://sepolia.etherscan.io/tx/0x873ff9f6a8bb10e424e8d4cb48c1a5c9f95cf73370b15fd6dfd27fcfa0b21da3)

## Schema

To view the schema, run
```bash 
npx prisma studio
```
