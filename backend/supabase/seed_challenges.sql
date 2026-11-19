-- Seed: kadai awal (dari kode lama). Jalankan SETELAH schema challenges dibuat.

with c as (
  insert into public.challenges (difficulty, title, description, icon, sort_order)
  values ('beginner', 'Terraform 基本コマンド', '短くて入力しやすいTerraformコマンドからスタート', '🌿', 1)
  returning id
)
insert into public.challenge_steps (challenge_id, sort_order, command, explanation)
select c.id, v.n, v.cmd, v.expl
from c, (values
    (1, 'terraform init', 'Terraformプロジェクトを初期化する'),
    (2, 'terraform fmt', '設定ファイルをフォーマットする'),
    (3, 'terraform validate', '設定ファイルの構文を検証する'),
    (4, 'terraform plan', '実行計画を確認する'),
    (5, 'terraform destroy', '作成したリソースをすべて削除する')
) as v(n, cmd, expl);

with c as (
  insert into public.challenges (difficulty, title, description, icon, sort_order)
  values ('beginner', 'クラウド基本確認', 'AWS CLIとkubectlの短い確認コマンドを練習する', '🔍', 2)
  returning id
)
insert into public.challenge_steps (challenge_id, sort_order, command, explanation)
select c.id, v.n, v.cmd, v.expl
from c, (values
    (1, 'aws s3 ls', 'S3バケットの一覧を表示する'),
    (2, 'aws configure list', '現在のAWS設定を確認する'),
    (3, 'kubectl get nodes', 'Kubernetesのノード一覧を表示する'),
    (4, 'kubectl get pods', 'Podの一覧と状態を表示する'),
    (5, 'kubectl get services', 'Serviceの一覧を表示する')
) as v(n, cmd, expl);

with c as (
  insert into public.challenges (difficulty, title, description, icon, sort_order)
  values ('beginner', 'Kubernetes リソース確認', 'Kubernetesリソースを確認する短いコマンドを練習する', '☸️', 3)
  returning id
)
insert into public.challenge_steps (challenge_id, sort_order, command, explanation)
select c.id, v.n, v.cmd, v.expl
from c, (values
    (1, 'kubectl get pods', 'Podの一覧と状態を表示する'),
    (2, 'kubectl get nodes', 'ノードの一覧と状態を表示する'),
    (3, 'kubectl get services', 'Serviceの一覧を表示する'),
    (4, 'kubectl get deployments', 'Deploymentの一覧を表示する'),
    (5, 'kubectl get namespaces', 'Namespaceの一覧を表示する')
) as v(n, cmd, expl);

with c as (
  insert into public.challenges (difficulty, title, description, icon, sort_order)
  values ('intermediate', 'AWSリソースの確認', 'フラグ付きAWS CLIコマンドでリソース情報を取得する', '🔎', 1)
  returning id
)
insert into public.challenge_steps (challenge_id, sort_order, command, explanation)
select c.id, v.n, v.cmd, v.expl
from c, (values
    (1, 'aws ec2 describe-instances', 'EC2インスタンスの詳細情報を取得する'),
    (2, 'aws ec2 describe-regions --all-regions', '利用可能な全リージョンを表示する'),
    (3, 'aws s3 mb s3://my-bucket-2024', '新しいS3バケットを作成する'),
    (4, 'aws s3 cp index.html s3://my-bucket/', 'ファイルをS3バケットにアップロードする'),
    (5, 'aws iam list-attached-user-policies --user-name admin', 'ユーザーにアタッチされたポリシー一覧を表示する')
) as v(n, cmd, expl);

with c as (
  insert into public.challenges (difficulty, title, description, icon, sort_order)
  values ('intermediate', 'Terraform + Kubernetes 応用', '中程度の長さのコマンドを正確に入力する練習', '🔧', 2)
  returning id
)
insert into public.challenge_steps (challenge_id, sort_order, command, explanation)
select c.id, v.n, v.cmd, v.expl
from c, (values
    (1, 'terraform apply -auto-approve', '確認なしでインフラを作成する'),
    (2, 'kubectl apply -f deployment.yaml', 'マニフェストファイルを適用する'),
    (3, 'kubectl describe node my-node', 'ノードの詳細情報を表示する'),
    (4, 'kubectl get pods --all-namespaces', '全NamespaceのPodを表示する'),
    (5, 'kubectl scale deployment my-app --replicas=3', 'Deploymentのレプリカ数を変更する')
) as v(n, cmd, expl);

with c as (
  insert into public.challenges (difficulty, title, description, icon, sort_order)
  values ('intermediate', 'EKS 基本操作', 'EKSクラスターの操作で使う中程度のコマンドを練習する', '⚙️', 3)
  returning id
)
insert into public.challenge_steps (challenge_id, sort_order, command, explanation)
select c.id, v.n, v.cmd, v.expl
from c, (values
    (1, 'aws eks list-clusters --region ap-northeast-1', 'リージョン内のEKSクラスター一覧を表示する'),
    (2, 'kubectl rollout status deployment/my-app', 'デプロイメントのロールアウト状況を確認する'),
    (3, 'kubectl logs -f deployment/my-app', 'デプロイメントのログをリアルタイムで表示する'),
    (4, 'kubectl exec -it my-pod -- /bin/bash', 'Pod内でbashを起動してログインする')
) as v(n, cmd, expl);

with c as (
  insert into public.challenges (difficulty, title, description, icon, sort_order)
  values ('advanced', 'EC2 セキュリティ設定', '長いオプション・記号が多い上級コマンドに挑戦', '🛡️', 1)
  returning id
)
insert into public.challenge_steps (challenge_id, sort_order, command, explanation)
select c.id, v.n, v.cmd, v.expl
from c, (values
    (1, 'aws ec2 create-security-group --group-name web-sg --description "Web SG"', 'EC2用セキュリティグループを作成する'),
    (2, 'aws ec2 authorize-security-group-ingress --group-name web-sg --protocol tcp --port 80 --cidr 0.0.0.0/0', 'HTTP(80番ポート)の受信ルールを追加する'),
    (3, 'aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --count 1 --instance-type t2.micro --security-groups web-sg', 'EC2インスタンスを起動する')
) as v(n, cmd, expl);

with c as (
  insert into public.challenges (difficulty, title, description, icon, sort_order)
  values ('advanced', 'EKS クラスター構築', 'EKSクラスターを構築する長いコマンドに挑戦', '🏗️', 2)
  returning id
)
insert into public.challenge_steps (challenge_id, sort_order, command, explanation)
select c.id, v.n, v.cmd, v.expl
from c, (values
    (1, 'aws eks update-kubeconfig --region ap-northeast-1 --name prod-cluster', 'kubeconfigを更新してEKSクラスターに接続する'),
    (2, 'eksctl create cluster --name prod-cluster --region ap-northeast-1 --node-type t3.medium --nodes 3', 'マネージドEKSクラスターを作成する'),
    (3, 'kubectl expose deployment my-app --type=LoadBalancer --port=80', '外部ロードバランサーを作成する'),
    (4, 'aws ec2 describe-instances --filters Name=instance-state-name,Values=running --query Reservations[].Instances[].PublicIpAddress', '実行中インスタンスのIPアドレスを取得する')
) as v(n, cmd, expl);

