CREATE TABlE user(
    id VARCHAR(50) primary key,
    username VARCHAR(50) unique,
    email VARCHAR(50) unique not null,
    password VARCHAR(50) not null
);