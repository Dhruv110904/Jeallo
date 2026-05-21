# Database Initialization Dump Folder

Place any `.sql` or `.sql.gz` files containing your existing database structure and credentials in this folder.

When the MySQL container initializes for the first time, it will automatically execute these scripts.

## How to Export your Existing Database:

Run this command in your host terminal to export your existing database to this folder:
```bash
mysqldump -u root -p jeallo > docker-entrypoint-initdb.d/backup.sql
```

## If the Docker Database has already initialized:
The automatic import only runs on the **first boot** of the database volume. If you have already started the containers and want to force a re-import:
1. Export your SQL dump to this folder.
2. Run this command to reset the database volume and restart:
   ```bash
   docker compose down -v
   docker compose up -d
   ```
   *(Note: `down -v` will erase the current empty volume so that the initialization scripts are triggered again on the next boot).*
