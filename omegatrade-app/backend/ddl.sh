# Create instance in local cloud spanner emulator 

gcloud spanner instances create omegatrade-instance --config=emulator-config \
--description="OmegaTrade Instance - Cloud Spanner Emulator" --nodes=1

# Create a database in emulator

gcloud spanner databases create omegatrade-db --instance omegatrade-instance

# Create users table

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl "CREATE TABLE users (
userId STRING(36) NOT NULL,
businessEmail STRING(50),
fullName STRING(36),
password STRING(100),
photoUrl STRING(250),
provider STRING(20)
) PRIMARY KEY(userId)"

# Create companies table

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl "CREATE TABLE companies (
companyId STRING(36) NOT NULL,
companyName STRING(30),
companyShortCode STRING(15),
created_at TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)) PRIMARY KEY(companyId)"

# Create CompanyStocks table

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl "CREATE TABLE companyStocks (
companyStockId STRING(36) NOT NULL,
companyId STRING(36) NOT NULL,
companyShortCode STRING(10),
exchangeName STRING(50),
exchangeMic STRING(50),
timezone STRING(50), 
shares   FLOAT64,
requestId STRING(15),
open FLOAT64,
volume FLOAT64,
currentValue FLOAT64,
date FLOAT64,
close FLOAT64,
dayHigh FLOAT64,
dayLow FLOAT64,
adjHigh FLOAT64,
adjLow FLOAT64,
adjClose FLOAT64,
adjOpen FLOAT64,
adjVolume FLOAT64,
timestamp TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)
) PRIMARY KEY(companyStockId)"


# Create simulations table

gcloud spanner databases ddl update omegatrade-db --instance omegatrade-instance --ddl "CREATE TABLE simulations (
sId STRING(36) NOT NULL,
companyId STRING(36) NOT NULL,
status BOOL,
createdAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)
) PRIMARY KEY(sId)"
