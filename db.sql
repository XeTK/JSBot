/* Servers */

create table servers (
	id            integer primary key autoincrement,
	url           char(100)             not null,
	port          integer               not null,
	enabled       char(1)               not null,
	created_date  datetime              not null,
	modified_date datetime              not null
);

create trigger servers_create 
	after insert on servers for each row
begin 
	update servers 
	set    created_date = datetime('now', 'localtime')
	where  rowid = new.rowid;
end;

create trigger servers_modified 
	after update on servers for each row
begin 
	update servers 
	set    modified_date = datetime('now', 'localtime')
	where  rowid = new.rowid;
end;

/* Channels */

create table channels (
	id            integer primary key autoincrement,
	name          char(25)             not null,
	server_id     integer              not null,
	enabled       char(1)              not null,
	created_date  datetime             not null,
	modified_date datetime             not null,
	foreign key(server_id) references servers(id)
);

create trigger channels_create 
	after insert on channels for each row
begin 
	update channels 
	set    created_date = datetime('now', 'localtime')
	where  rowid = new.rowid;
end;

create trigger channels_modified 
	after update on channels for each row
begin 
	update channels 
	set    modified_date = datetime('now', 'localtime')
	where  rowid = new.rowid;
end;

/* Users */

create table users (
	id            integer primary key autoincrement,
	name          char(25)             not null,
	server_id     integer              not null,
	created_date  datetime             not null,
	modified_date datetime             not null,
	foreign key(server_id) references servers(id)
);

create trigger users_create 
	after insert on users for each row
begin 
	update users 
	set    created_date = datetime('now', 'localtime')
	where  rowid = new.rowid;
end;

create trigger users_modified 
	after update on users for each row
begin 
	update users 
	set    modified_date = datetime('now', 'localtime')
	where  rowid = new.rowid;
end;

/*
	Finish up:
		messages,
		quits,
		parts,
		joins,
		modes,
		kicks,
		invites
*/

