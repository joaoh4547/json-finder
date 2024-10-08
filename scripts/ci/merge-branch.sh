#!/bin/bash

set -e
#
git remote set-url origin https://x-access-token:"${PAT_TOKEN}"@github.com/"${PAT_REPO}".git
git config --global user.email "action@github.com"
git config --global user.name "GitHub Action"

git fetch --all

source_branch_prefix=""
dest_branch=""

while [ $# -gt 0 ]; do
  case "$1" in
    -source=*)
      source_branch_prefix="${1#*=}"
      ;;
    -dest=*)
      dest_branch="${1#*=}"
      ;;
    *)
      echo "Opção inválida: $1"
      exit 1
  esac
  shift
done



checkout_base_branch() {
  git checkout "$1"
}

try_merge(){
  local merge_branch="$1"
  if ! git merge "$merge_branch"; then
    return 1
  fi
  return 0
}

create_pull_request() {
  local source_branch="$1"
  local dest_branch="$2"

  curl -X POST \
    -H "Authorization: Bearer ${REPO_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/repos/"${PAT_REPO}"/pulls \
    -d "{
      \"title\": \"Conflicts to merge branch $source_branch into $dest_branch\",
      \"body\": \"Create automatic PR to resolve conflicts betwen $source_branch and $dest_branch\",
      \"head\": \"$source_branch\",
      \"base\": \"$dest_branch\"
    }"
}


is_branch_exists() {
  local branch_name="$1"

  # Verifica localmente
  if git show-ref --verify --quiet refs/heads/"$branch_name"; then
    echo "A branch '$branch_name' existe localmente."
    return 0
  fi

  # Verifica remotamente
  remote_branch=$(git ls-remote --heads origin "$branch_name" | awk '{print $2}')

  if [[ "$remote_branch" == "refs/heads/$branch_name" ]]; then
    echo "A branch '$branch_name' existe no repositório remoto."
    return 0
  fi

  echo "A branch '$branch_name' não existe nem localmente nem remotamente."
  return 1
}



branch_format="${source_branch_prefix}-*"
branch_dest_format="${dest_branch}-*"

echo "Branch format: ${branch_format}"

branch_name="${source_branch_prefix}"

dest_branch_name="$dest_branch"

if [[ "$source_branch_prefix" == *"release"* ]]; then
  branch_name=$(git ls-remote --heads origin "$branch_format" | awk '{print $2}' | grep -o 'release-.*' | head -n 1)
elif [[ "$source_branch_prefix" == *"hotfix"* ]]; then
    branch_name=$(git ls-remote --heads origin "$branch_format" | awk '{print $2}' | grep -o 'hotfix-.*' | head -n 1)
fi

if [[ "$dest_branch" == *"release"* ]]; then
  dest_branch_name=$(git ls-remote --heads origin "$branch_dest_format" | awk '{print $2}' | grep -o 'release-.*' | head -n 1)
elif [[ "$dest_branch" == *"hotfix"* ]]; then
  dest_branch_name=$(git ls-remote --heads origin "$branch_dest_format" | awk '{print $2}' | grep -o 'hotfix-.*' | head -n 1)
fi



if [ -z "$branch_name" ]; then
  branch_name="${source_branch_prefix}"
fi

if [ -z "$dest_branch_name" ]; then
  dest_branch_name="$dest_branch"
fi


if ! is_branch_exists "$branch_name" ; then
  echo "Branch de origem não existe: $branch_name"
  exit 0
fi

if ! is_branch_exists "$dest_branch_name" ; then
  echo "Branch de destino não existe: $dest_branch_name"
  exit 0
fi


echo "Branch remota de origem encontrada para o merge: $branch_name"
git checkout "$dest_branch_name"

if try_merge "$branch_name"; then
  echo "Merge realizado com sucesso. Branch de destino: $dest_branch_name"
  git push origin "$dest_branch_name"
else
  create_pull_request "$branch_name" "$dest_branch_name"
fi

