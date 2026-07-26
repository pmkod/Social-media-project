local typedefs = require "kong.db.schema.typedefs"

return {
	name = "jwt-auth",
	fields = {
		{ consumer = typedefs.no_consumer },
		{ protocols = typedefs.protocols_http },
		{
			config = {
				type = "record",
				fields = {
					{
						secret = {
							type = "string",
							required = true,
							referenceable = true,
						},
					},
					{
						issuer = {
							type = "string",
							required = false,
						},
					},
					{
						header_name = {
							type = "string",
							default = "Authorization",
						},
					},
					{
						user_id_claim = {
							type = "string",
							default = "userId",
						},
					},
					{
						upstream_header = {
							type = "string",
							default = "X-User-Id",
						},
					},
				},
			},
		},
	},
}
