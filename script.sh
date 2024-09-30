#!/bin/bash

# script.sh
set -e  # Interrompe o script se um comando falhar

# Função para obter a versão atual
get_current_version() {
    VERSION=$(jq -r .version package.json)
    echo "$VERSION"
}

# Função para incrementar a versão
increment_version() {
    IFS='.' read -r major minor patch <<< "$1"
    new_minor=$((minor + 1))
    new_version="${major}.${new_minor}.0"  # Mantém o patch em 0
    echo "$new_version"
}

# Função para atualizar o package.json
update_package_json() {
    new_version="$1"
    jq --arg new_version "$new_version" '.version = $new_version' package.json > tmp.json && mv tmp.json package.json
}

# Função para criar a branch de release
create_release_branch() {
    git checkout -b "release-$1"
    git push https://${REPO_TOKEN}@github.com/joaoh4547/json-finder.git "release-$1"
}

# Início do script
echo "Iniciando o processo de abertura de versão..."
current_version=$(get_current_version)
echo "Versão atual: $current_version"

new_version=$(increment_version "$current_version")
echo "Nova versão: $new_version"

update_package_json "$new_version"
echo "package.json atualizado para a nova versão: $new_version"

# Configura o git
git config --global user.email "action@github.com"
git config --global user.name "GitHub Action"
git add package.json
git commit -m "Atualiza versão da develop para $new_version"

# Push para a branch develop
git push origin develop

# Cria a branch de release
create_release_branch "$new_version"
