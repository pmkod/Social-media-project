local openssl_hmac = require "resty.openssl.hmac"
local cjson = require "cjson.safe"

local JwtAuthHandler = {
	VERSION = "1.0.0",
	PRIORITY = 1500,
}

local function base64url_decode(input)
	local remainder = #input % 4
	if remainder > 0 then
		input = input .. string.rep("=", 4 - remainder)
	end

	input = input:gsub("-", "+"):gsub("_", "/")
	return ngx.decode_base64(input)
end

local function decode_json(input)
	local decoded = base64url_decode(input)
	if not decoded then
		return nil
	end

	return cjson.decode(decoded)
end

local function verify_signature(header_b64, payload_b64, signature_b64, secret)
	local signature = base64url_decode(signature_b64)
	if not signature then
		return false
	end

	local hmac, err = openssl_hmac.new(secret, "sha256")
	if not hmac then
		return false
	end

	local computed = hmac:final(header_b64 .. "." .. payload_b64)
	return computed == signature
end

local function unauthorized(message)
	return kong.response.exit(401, {
		success = false,
		error = {
			code = "UNAUTHORIZED",
			message = message or "Unauthorized",
		},
	})
end

function JwtAuthHandler:access(conf)
	local auth_header = kong.request.get_header(conf.header_name)
	if not auth_header then
		return unauthorized("Missing authorization header")
	end

	local scheme, token = auth_header:match("^(Bearer)%s+(%S+)$")
	if not token then
		scheme, token = auth_header:match("^(bearer)%s+(%S+)$")
	end
	if not token then
		return unauthorized("Invalid authorization header")
	end

	local header_b64, payload_b64, signature_b64 = token:match("^([^.]+)%.([^.]+)%.([^.]+)$")
	if not header_b64 or not payload_b64 or not signature_b64 then
		return unauthorized("Invalid token format")
	end

	local header = decode_json(header_b64)
	if not header or header.alg ~= "HS256" then
		return unauthorized("Invalid token algorithm")
	end

	local payload = decode_json(payload_b64)
	if not payload then
		return unauthorized("Invalid token payload")
	end

	if conf.issuer and conf.issuer ~= "" and payload.iss ~= conf.issuer then
		return unauthorized("Invalid token issuer")
	end

	if not payload.exp or payload.exp <= ngx.time() then
		return unauthorized("Token expired")
	end

	if not verify_signature(header_b64, payload_b64, signature_b64, conf.secret) then
		return unauthorized("Invalid token signature")
	end

	local user_id = payload[conf.user_id_claim]
	if not user_id then
		return unauthorized("Missing user identity in token")
	end

	kong.service.request.set_header(conf.upstream_header, tostring(user_id))
end

return JwtAuthHandler
