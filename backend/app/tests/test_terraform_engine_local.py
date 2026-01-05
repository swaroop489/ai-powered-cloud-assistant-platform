import asyncio
import os
import sys

# Ensure backend directory is in python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.terraform_service import TerraformService

# 1. Simple Terraform Code (Creates a text file, no AWS cost)
TEST_TF_CODE = """
resource "local_file" "hello_world" {
  content  = "This file was created by the AI Platform Engine!"
  filename = "${path.module}/hello.txt"
}

output "file_path" {
  value = local_file.hello_world.filename
}
"""

async def main():
    print("STARTING ENGINE TEST...")
    
    # 2. Initialize Service in a temporary folder
    work_dir = "./temp_test_deploy"
    service = TerraformService(work_dir)
    
    # 3. Write Configuration
    print(f"\nWriting main.tf to {work_dir}...")
    service.write_main_tf(TEST_TF_CODE)
    
    # 4. Run Init
    print("\nRunning 'terraform init'...")
    async for line in service.init():
        print(f"  [LOG] {line.strip()}")

    # 5. Run Plan
    print("\nRunning 'terraform plan'...")
    async for line in service.plan():
        print(f"  [LOG] {line.strip()}")

    # 6. Run Apply
    print("\nRunning 'terraform apply'...")
    async for line in service.apply():
        print(f"  [LOG] {line.strip()}")

    # 7. Get Outputs
    print("\nFetching Outputs...")
    outputs = await service.get_outputs()
    print(f"  [OUTPUT] {outputs}")

    # 8. Clean up (Destroy)
    # print("\nRunning 'terraform destroy'...")
    # async for line in service.destroy():
    #     print(f"  [LOG] {line.strip()}")

    print("\nTEST COMPLETE.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nTest interrupted by user.")
    except Exception as e:
        print(f"\nTest failed: {e}")