# Arkesia.gg Website - A Lost Ark interactive map

- [Website](https://arkesia.gg)
- [Overwolf App on GitHub](https://github.com/lmachens/arkesia.gg-overwolf)

## Contribution

This app is Open Source. Contributors are highly welcome!

Join us on our [Discord](https://discord.com/invite/NTZu8Px).

### Requirements

This project uses [Node.js](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/).
You need to set some environment variables to run the app. A common way is to create an `.env` file, based on `template.env`.

```
cp template.env .env
```

The following list shows the variables you need to set:

| KEY                 | VALUE                                                        |
| ------------------- | ------------------------------------------------------------ |
| DATABASE_URL        | URI of your PostgreSQL database                              |
| DISCORD_WEBHOOK_URL | Discord webhook URL for notifications (optional)             |
| SUPABASE_URL        | Supabase URL for storage (required for image upload)         |
| SUPABASE_PUBLIC_KEY | Supabase Public Key (required client side database access)   |
| SUPABASE_SECRET_KEY | Supabase Private Key for storage (required for image upload) |
| PLAUSIBLE_API_HOST  | Plausible API host (optional)                                |
| PLAUSIBLE_DOMAIN    | Plausible domain (optional)                                  |

In order for the screenshot file upload to work locally, you need to create a [Supabase](https://supabase.com/) account, activate the [storage](https://supabase.com/storage) feature, [create a new bucket](https://supabase.com/docs/guides/storage#create-a-bucket) called `nodes` and make it public.

### Development

From your terminal, you need to install the dependencies first:

```sh
npm install
```

Then you need to synchronize the Prisma schema with the PostgreSQL database schema:

```sh
npx prisma migrate dev
```

Now you are ready to start the app in development mode:

```sh
npm run dev
```

### Sample data

The app requires a user to add and maintain nodes. You can create a user with the following script:

```sh
npx prisma db seed
```

Prisma has an integrated client to explore your database:

```sh
npx prisma studio
```

### Libraries

The project is based on [Remix](https://remix.run/), a full stack [React](https://reactjs.org/) web framework focused on user experience and performance.
For UI components, we use [Mantine](https://mantine.dev/).
The database is connected via [Prisma](https://www.prisma.io/), an ORM which connects to [PostgreSQL](https://www.postgresql.org/).

Please refer to these documentations for more information.

## Deployment

The app is deployed on [Vercel](https://vercel.com/).

## Licensing

MIT
