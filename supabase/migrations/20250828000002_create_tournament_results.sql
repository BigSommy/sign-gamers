-- Create tournament_results table
create table "public"."tournament_results" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "tournament_id" uuid not null references tournaments(id) on delete cascade,
    "user_id" uuid not null references auth.users(id) on delete cascade,
    "position" integer not null,
    "prize" text,
    primary key ("id"),
    -- Ensure each user has only one position in a tournament
    unique("tournament_id", "user_id"),
    -- Ensure each position in a tournament is unique
    unique("tournament_id", "position")
);

-- Set up RLS (Row Level Security)
alter table "public"."tournament_results" enable row level security;

-- Create policies
-- Allow anyone to read tournament results
create policy "Tournament results are viewable by everyone"
    on "public"."tournament_results"
    for select
    using (true);

-- Only admins and game hosts can insert/update/delete tournament results
create policy "Only admins and game hosts can insert tournament results"
    on "public"."tournament_results"
    for insert
    with check (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role in ('admin', 'game_host')
        )
    );

create policy "Only admins and game hosts can update tournament results"
    on "public"."tournament_results"
    for update
    using (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role in ('admin', 'game_host')
        )
    )
    with check (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role in ('admin', 'game_host')
        )
    );

create policy "Only admins and game hosts can delete tournament results"
    on "public"."tournament_results"
    for delete
    using (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role in ('admin', 'game_host')
        )
    );

-- Add indexes for performance
create index tournament_results_tournament_id_idx on tournament_results(tournament_id);
create index tournament_results_user_id_idx on tournament_results(user_id);
create index tournament_results_position_idx on tournament_results(position);

-- Update Types
create type "public"."tournament_result_with_player" as (
    "id" uuid,
    "tournament_id" uuid,
    "user_id" uuid,
    "position" integer,
    "prize" text,
    "player" jsonb
);

-- Function to get tournament results with player details
create or replace function get_tournament_results(tournament_id uuid)
returns setof tournament_result_with_player
language plpgsql
security definer
as $$
begin
    return query
    select 
        tr.id,
        tr.tournament_id,
        tr.user_id,
        tr.position,
        tr.prize,
        jsonb_build_object(
            'username', up.username,
            'profile_picture_url', up.profile_picture_url
        ) as player
    from tournament_results tr
    inner join user_profiles up on tr.user_id = up.user_id
    where tr.tournament_id = $1
    order by tr.position asc;
end;
$$;
