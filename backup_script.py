import os
import subprocess
import datetime

BACKUP_DIR = '/Users/MN/Desktop/db_backup'
CA_CERT    = '/Users/MN/Downloads/ca.pem'

HOST     = os.environ['DB_HOST']
PORT     = int(os.environ.get('DB_PORT', 3306))
USER     = os.environ['DB_USER']
PASSWORD = os.environ['DB_PASSWORD']
DB_NAME  = os.environ['DB_NAME']

def backup_database(host, port, user, password, db_name, ca_cert, backup_dir):
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    backup_file = os.path.join(backup_dir, f"{db_name}_backup_{timestamp}.sql")
    dump_command = (
        f"/opt/homebrew/opt/mysql/bin/mysqldump "
        f"-h {host} --port={port} -u {user} -p{password} "
        f"--ssl-ca={ca_cert} "
        f"{db_name} > {backup_file}"
    )
    try:
        subprocess.run(dump_command, shell=True, check=True)
        if os.path.getsize(backup_file) > 0:
            print(f"Backup successful: {backup_file}")
        else:
            print("Backup file is empty — check your connection settings.")
    except subprocess.CalledProcessError as e:
        print(f"Backup failed: {e}")

backup_database(HOST, PORT, USER, PASSWORD, DB_NAME, CA_CERT, BACKUP_DIR)