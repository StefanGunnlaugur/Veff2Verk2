create table notes (
  id serial primary key,
  dags timestamp not null default CURRENT_TIMESTAMP, 
  name varchar(64) not null,
  email varchar(64) not null,
  ssn varchar(64) not null,
  fjoldi int not null
);
