#!/bin/bash


git remote set-url origin https://x-access-token:"${PAT_TOKEN}"@github.com/"${PAT_REPO}".git
git config --global user.email "action@github.com"
git config --global user.name "GitHub Action"

set -e

# Variável para armazenar o tipo
type=""

# Lista de valores permitidos
allowed_values=("hotfix" "release" "feature")

declare -A version_type_source_branch

version_type_source_branch=(
    ["hotfix"]="main"
    ["release"]="develop"
)

get_current_version() {
    VERSION=$(jq -r .version package.json)
    echo "$VERSION"
}

create_milestone() {
  local version=$1
  local description="Create a version $version"
  end_date=$(date -d "+30 days" +%Y-%m-%d)
##  gh issue create --milestone "Demo" --repo="${PAT_REPO}" --title="$version" --description="$description" --due-date="$end_date"
##  gh issue create --milestone "Demo" --title "hello from cli" \
##     --repo "${PAT_REPO}"\
##     --body "Body bidon from cli"
#
#  gh milestone create --title "$version" --description "$description" --due-date "$end_date"
  # GitHub CLI api
  # https://cli.github.com/manual/gh_api

  gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    /repos/"${PAT_REPO}"/milestones \
     -f "title=$version" -f "state=open" -f "description=$description" -f "due_on=$end_date"

}


# Função para incrementar a versão
increment_version() {
    local incrementtype="$1"
    version=$(get_current_version)

    major=$(echo "$version" | cut -d '.' -f 1)
    minor=$(echo "$version" | cut -d '.' -f 2)
    patch=$(echo "$version" | cut -d '.' -f 3)

    new_version=""

    if [[ "$incrementtype" == "patch" ]]; then
      patch=$((patch + 1))
    elif [ "$incrementtype" == "minor" ]; then
        minor=$((minor + 1))
    elif [[ "$incrementtype" == "major" ]]; then
        major=$((major + 1))
        minor=0
        patch=0
    fi

    new_version="${major}.${minor}.${patch}"  # Mantém o patch em 0
    echo "$new_version"
}

# Função para verificar se o valor está na lista de valores permitidos
is_valid_type() {
    local value="$1"
    for allowed in "${allowed_values[@]}"; do
        if [[ "$allowed" == "$value" ]]; then
            return 0
        fi
    done
    return 1
}


open_version_by_type(){
  case "$type" in
    hotfix)
      open_hotfix_version
      ;;
    release)
      open_release_version
      ;;
  esac
}

open_hotfix_version(){
  new_version=$(increment_version "patch")
  branch_name="hotfix-${new_version}"
  git fetch --all
  git checkout "${version_type_source_branch['hotfix']}"
  git checkout -b "$branch_name"
  echo "Versão hotfix: $new_version"
  echo "Branch criado: $branch_name"
  update_package_json "${new_version}"

  # Atualiza o commit message
  git commit -am "Create version $new_version"
  git push --set-upstream origin "$branch_name"
  git push origin "$branch_name"

  create_milestone "$branch_name"
  echo "Hotfix version $new_version successfully created"
}

update_package_json() {
    new_version="$1"
    jq --arg new_version "$new_version" '.version = $new_version' package.json > tmp.json && mv tmp.json package.json
}

open_release_version(){
    new_version=$(increment_version "minor")
    branch_name="release-${new_version}"
    git fetch --all
    git branch
    git checkout "${version_type_source_branch['release']}"
    git checkout -b "$branch_name"
    echo "Versão release: $new_version"
    echo "Branch criado: $branch_name"
    update_package_json "${new_version}"

    # Atualiza o commit message
    git commit -am "Create version $new_version"
    git push --set-upstream origin "$branch_name"
    git push origin "$branch_name"

    create_milestone "$branch_name"

    echo "Release version $new_version successfully created"
}

# Processando os argumentos
while [ $# -gt 0 ]; do
  case "$1" in
    -type=*)
      type="${1#*=}"
      ;;
    *)
      echo "Opção inválida: $1"
      exit 1
  esac
  shift
done

# Verifica se o parâmetro -type foi fornecido
if [[ -z "$type" ]]; then
  echo "Erro: O parâmetro -type é obrigatório."
  exit 1
fi

# Verifica se o valor do tipo é permitido
if ! is_valid_type "$type"; then
  echo "Erro: O valor '$type' não é permitido para o parâmetro -type."
  echo "Valores permitidos: ${allowed_values[*]}"
  exit 1
fi

#gh extension upgrade --all
#gh extension install valeriobelli/gh-milestone
echo "Tipo de versão escolhida: $type"

echo "${PAT_REPO}"

open_version_by_type
