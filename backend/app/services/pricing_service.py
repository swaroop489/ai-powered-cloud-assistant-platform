import boto3
import json
import logging
from app.schemas.deployment_schema import DeploymentRequest

logger = logging.getLogger(__name__)

class PricingService:
    def __init__(self):
        try:
            self.client = boto3.client('pricing', region_name='us-east-1')
        except Exception as e:
            logger.warning(f"Could not initialize AWS Pricing client: {e}")
            self.client = None

    def get_ec2_cost(self, instance_type: str, region: str) -> float:
        if self.client:
            try:
                response = self.client.get_products(
                    ServiceCode='AmazonEC2',
                    Filters=[
                        {'Type': 'TERM_MATCH', 'Field': 'instanceType', 'Value': instance_type},
                        {'Type': 'TERM_MATCH', 'Field': 'operatingSystem', 'Value': 'Linux'},
                        {'Type': 'TERM_MATCH', 'Field': 'preInstalledSw', 'Value': 'NA'},
                        {'Type': 'TERM_MATCH', 'Field': 'capacitystatus', 'Value': 'Used'},
                        {'Type': 'TERM_MATCH', 'Field': 'tenancy', 'Value': 'Shared'}
                    ],
                    MaxResults=1
                )
                if response.get('PriceList'):
                    price_item = json.loads(response['PriceList'][0])
                    terms = price_item['terms']['OnDemand']
                    term = list(terms.values())[0]
                    price_dimension = list(term['priceDimensions'].values())[0]
                    hourly_rate = float(price_dimension['pricePerUnit']['USD'])
                    return round(hourly_rate * 730, 2) # 730 hours in a month
            except Exception as e:
                logger.error(f"Failed to fetch real EC2 pricing: {e}")
        
        # Fallback pricing
        base_prices = {
            "t2.micro": 8.5,
            "t3.micro": 7.5,
            "t3.small": 15.0,
            "t3.medium": 30.0,
            "m5.large": 70.0
        }
        return base_prices.get(instance_type, 25.0)

    def get_rds_cost(self, storage_gb: int) -> float:
        return 15.0 + (storage_gb * 0.115)

    def get_s3_cost(self) -> float:
        return 5.0

    def estimate_cost(self, plan: DeploymentRequest) -> float:
        total_cost = 0.0
        for resource in plan.resources:
            if resource.type == "ec2":
                total_cost += self.get_ec2_cost(resource.instance_type.value, plan.region.value)
            elif resource.type == "rds":
                total_cost += self.get_rds_cost(resource.storage_gb)
            elif resource.type == "s3":
                total_cost += self.get_s3_cost()
            elif resource.type == "vpc":
                if getattr(resource, "enable_nat_gateway", False):
                    total_cost += 32.0 # approx NAT Gateway monthly cost
        return round(total_cost, 2)
