#!/bin/sh
set -e

# Ajustar permissões do diretório de dados para o usuário appuser
mkdir -p /data
chown -R appuser:appgroup /data

# Executar o comando original como appuser
exec su-exec appuser:appgroup java -jar app.jar