create table public."userData" (
  created_at timestamp with time zone not null default now(),
  username character varying not null,
  password character varying not null,
  email character varying not null,
  expired boolean null default true,
  updated_at timestamp with time zone null default now(),
  role character varying null default '''user''::character varying'::character varying,
  user_id uuid not null default gen_random_uuid (),
  firstname text not null,
  lastname text not null,
  middlename text null,
  address text null,
  phone_number bigint null,
  constraint userData_pkey primary key (email),
  constraint userData_user_id_key unique (user_id)
) TABLESPACE pg_default;